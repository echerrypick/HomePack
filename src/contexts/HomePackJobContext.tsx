import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { Address, HomePackJob, ReportResult } from '@/types';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { authenticatedFetch } from '@/lib/billing-client';
import { useAuth } from './AuthContext';

function unwrapLinkedDataValues(value: any): any {
  if (Array.isArray(value)) return value.map(unwrapLinkedDataValues);
  if (!value || typeof value !== 'object') return value;

  const keys = Object.keys(value);
  if ('value' in value && keys.every(key => ['value', 'language', 'lang', 'type', 'datatype'].includes(key))) {
    return unwrapLinkedDataValues(value.value);
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, nestedValue]) => [key, unwrapLinkedDataValues(nestedValue)])
  );
}

interface SavedReportSummary {
  id: string;
  addressString: string;
  address: Address;
  completedAt: number;
  result?: ReportResult;
  hash?: string;
  planningScope?: 'street' | 'radius';
}

interface HomePackJobContextType {
  activeJob: HomePackJob | null;
  isModalOpen: boolean;
  recentReports: SavedReportSummary[];
  historyLoading: boolean;
  historyError: string | null;
  hasMoreReports: boolean;
  refreshReports: () => Promise<void>;
  loadMoreReports: () => Promise<void>;
  openSavedReport: (report: SavedReportSummary, fromHistory?: boolean) => Promise<void>;
  startJob: (address: Address) => Promise<string>;
  openModal: () => void;
  closeModal: () => void;
  dismissActiveJob: () => void;
  loadReport: (report: ReportResult, address: Address, fromHistory?: boolean) => void;
}

const HomePackJobContext = createContext<HomePackJobContextType | null>(null);

export function useHomePackJob() {
  const context = useContext(HomePackJobContext);
  if (!context) {
    throw new Error('useHomePackJob must be used within a HomePackJobProvider');
  }
  return context;
}

export function HomePackJobProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10">Loading…</div>;
  return <AccountJobs key={user?.uid || 'guest'}>{children}</AccountJobs>;
}

function AccountJobs({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const ACTIVE_JOB_KEY = `homepack_active_job_id:${user?.uid || 'guest'}`;
  const RECENT_REPORTS_KEY = `homepack_recent_reports:${user?.uid || 'guest'}`;
  const [activeJob, setActiveJob] = useState<HomePackJob | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recentReports, setRecentReports] = useState<SavedReportSummary[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_REPORTS_KEY);
      return saved ? unwrapLinkedDataValues(JSON.parse(saved)) : [];
    } catch {
      return [];
    }
  });

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<{ at: number; id: string } | null>(null);
  const cursorRef = useRef(nextCursor);
  cursorRef.current = nextCursor;
  const historyRequest = useRef(false);
  const historyLoaded = useRef(false);
  const pollDelay = useRef(2000);
  const reportCache = useRef(new Map<string, { hash?: string; result: ReportResult }>());
  const reportRequests = useRef(new Map<string, Promise<any>>());
  const fetchReports = useCallback(async (more = false) => {
    if (!user || historyRequest.current) return;
    historyRequest.current = true;
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const cursor = more ? cursorRef.current : null;
      const query = cursor ? `?afterAt=${cursor.at}&afterId=${cursor.id}` : '';
      const response = await authenticatedFetch(`/api/reports${query}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load report history.');
      setRecentReports(previous => {
        const cloudAddresses = new Set(data.reports.map((item: SavedReportSummary) => item.addressString.toLowerCase()));
        const local = (more ? previous : previous.filter(item => item.result)).filter(item => !item.result || !cloudAddresses.has(item.addressString.toLowerCase()));
        const combined = [...data.reports, ...local];
        const seen = new Set<string>();
        return combined.sort((a, b) => b.completedAt - a.completedAt).filter(item => {
          const key = item.id;
          if (seen.has(key)) return false;
          seen.add(key); return true;
        });
      });
      setNextCursor(data.nextCursor);
      historyLoaded.current = true;
    } catch (error: any) { setHistoryError(error.message); }
    finally { historyRequest.current = false; setHistoryLoading(false); }
  }, [user?.uid]);
  const refreshReports = useCallback(() => fetchReports(), [fetchReports]);
  const loadMoreReports = useCallback(() => fetchReports(true), [fetchReports]);
  useEffect(() => {
    if (!historyLoaded.current && ['/tool', '/profile', '/history'].includes(location.pathname)) void refreshReports();
  }, [refreshReports, location.pathname]);

  const saveRecentReport = useCallback((job: HomePackJob) => {
    if (!job.result) return;
    const id = (job as any).reportId;
    const hash = (job as any).reportHash;
    if (id) {
      reportCache.current.set(id, { hash, result: job.result });
      while (reportCache.current.size > 5) reportCache.current.delete(reportCache.current.keys().next().value!);
    }
    const entry: SavedReportSummary = { id: id || job.id, hash, planningScope: (job as any).planningScope, addressString: `${job.address.houseNumber} ${job.address.street}, ${job.address.town}, ${job.address.postcode}`.trim(), address: job.address, completedAt: job.completedAt || Date.now(), ...(!id ? { result: job.result } : {}) };
    setRecentReports(previous => [entry, ...previous.filter(item => item.id !== entry.id && (!item.result || item.addressString !== entry.addressString))]);
  }, []);

  // Poll a job by ID
  const pollJob = useCallback(async (jobId: string) => {
    try {
      const res = await authenticatedFetch(`/api/homepack/job/${jobId}`);
      if (!res.ok) {
        if (res.status === 404) {
          // Job expired or not found on server
          localStorage.removeItem(ACTIVE_JOB_KEY);
          setActiveJob(null);
        }
        return;
      }
      const data = unwrapLinkedDataValues(await res.json());
      const updatedJob: HomePackJob = data.job;
      pollDelay.current = data.pollAfterMs || 2000;

      setActiveJob(updatedJob);

      if (updatedJob.status === 'completed') {
        localStorage.removeItem(ACTIVE_JOB_KEY);
        if (pollTimerRef.current) {
          clearTimeout(pollTimerRef.current);
          pollTimerRef.current = null;
        }

        saveRecentReport(updatedJob);

        const addrLabel = `${updatedJob.address.houseNumber} ${updatedJob.address.street}`.trim() || updatedJob.address.postcode;
        toast.success('Your UK Property HomePack Report is ready', {
          id: `homepack-complete-${updatedJob.id}`,
          description: `${addrLabel} has finished compiling and is ready to review.`,
          duration: 6500,
          action: {
            label: 'Open report',
            onClick: () => {
              setIsModalOpen(false);
              navigate('/tool', { state: { report: updatedJob.result, address: updatedJob.address } });
            }
          }
        });
      } else if (updatedJob.status === 'failed') {
        localStorage.removeItem(ACTIVE_JOB_KEY);
        if (pollTimerRef.current) {
          clearTimeout(pollTimerRef.current);
          pollTimerRef.current = null;
        }
        toast.error(`Property report generation failed`, {
          description: updatedJob.error || 'An unexpected error occurred while compiling registers.'
        });
      }
    } catch (err) {
      console.warn('[HomePackJob] Polling error:', err);
    }
  }, [navigate, saveRecentReport]);

  // Restore active job from localStorage on initial mount (resilient to refresh)
  useEffect(() => {
    const savedJobId = localStorage.getItem(ACTIVE_JOB_KEY);
    if (savedJobId) {
      pollJob(savedJobId);
    }
  }, [pollJob]);

  // Sequential polling avoids overlapping requests; hidden tabs and database fallback poll less often.
  useEffect(() => {
    if (activeJob && activeJob.status === 'processing') {
      if (!pollTimerRef.current) {
        const tick = async () => {
          await pollJob(activeJob.id);
          if (pollTimerRef.current) pollTimerRef.current = setTimeout(tick, document.hidden ? 30_000 : pollDelay.current);
        };
        pollTimerRef.current = setTimeout(tick, pollDelay.current);
      }
    } else {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    }

    return () => {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [activeJob?.id, activeJob?.status, pollJob]);

  const startJob = async (address: Address): Promise<string> => {
    const res = await authenticatedFetch('/api/homepack/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(address)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to start generation' }));
      throw new Error(err.error || 'Failed to start generation');
    }

    const data = await res.json();
    const newJob: HomePackJob = data.job;

    setActiveJob(newJob);
    localStorage.setItem(ACTIVE_JOB_KEY, newJob.id);
    setIsModalOpen(true);
    return newJob.id;
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const dismissActiveJob = () => {
    localStorage.removeItem(ACTIVE_JOB_KEY);
    setActiveJob(null);
    setIsModalOpen(false);
  };

  const loadReport = (report: ReportResult, address: Address, fromHistory: boolean = false) => {
    setIsModalOpen(false);
    navigate('/tool', { state: { report: unwrapLinkedDataValues(report), address, fromHistory } });
  };

  const openSavedReport = async (entry: SavedReportSummary, fromHistory = false) => {
    try {
      if (entry.result) { loadReport(entry.result, entry.address, fromHistory); return; }
      const cached = reportCache.current.get(entry.id);
      if (cached && cached.hash === entry.hash) { loadReport(cached.result, entry.address, fromHistory); return; }
      let request = reportRequests.current.get(entry.id);
      if (!request) {
        request = authenticatedFetch(`/api/reports/${entry.id}`).then(async response => {
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'Unable to open report.');
          return data;
        }).finally(() => reportRequests.current.delete(entry.id));
        reportRequests.current.set(entry.id, request);
      }
      const data = await request;
      reportCache.current.set(entry.id, { hash: data.hash, result: data.result });
      while (reportCache.current.size > 5) reportCache.current.delete(reportCache.current.keys().next().value!);
      loadReport(data.result, data.address, fromHistory);
    } catch (error: any) { toast.error(error.message || 'Unable to open saved report. Please retry.'); }
  };

  return (
    <HomePackJobContext.Provider
      value={{
        activeJob,
        isModalOpen,
        recentReports,
        historyLoading, historyError, hasMoreReports: Boolean(nextCursor), refreshReports, loadMoreReports, openSavedReport,
        startJob,
        openModal,
        closeModal,
        dismissActiveJob,
        loadReport
      }}
    >
      {children}
    </HomePackJobContext.Provider>
  );
}
