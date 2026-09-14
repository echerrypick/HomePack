import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { Address, HomePackJob, ReportResult } from '@/types';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';

const ACTIVE_JOB_KEY = 'homepack_active_job_id';
const RECENT_REPORTS_KEY = 'homepack_recent_reports';

interface SavedReportSummary {
  id: string;
  addressString: string;
  address: Address;
  completedAt: number;
  result: ReportResult;
}

interface HomePackJobContextType {
  activeJob: HomePackJob | null;
  isModalOpen: boolean;
  recentReports: SavedReportSummary[];
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
  const [activeJob, setActiveJob] = useState<HomePackJob | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recentReports, setRecentReports] = useState<SavedReportSummary[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_REPORTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to persist recent reports
  const saveRecentReport = useCallback((job: HomePackJob) => {
    if (!job.result) return;
    const addressStr = `${job.address.houseNumber} ${job.address.street}, ${job.address.town}, ${job.address.postcode}`.trim();
    const entry: SavedReportSummary = {
      id: job.id,
      addressString: addressStr,
      address: job.address,
      completedAt: job.completedAt || Date.now(),
      result: job.result
    };

    setRecentReports(prev => {
      const filtered = prev.filter(p => p.id !== job.id && p.addressString !== addressStr);
      const updated = [entry, ...filtered].slice(0, 20);
      try {
        localStorage.setItem(RECENT_REPORTS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save to localStorage:', e);
      }
      return updated;
    });
  }, []);

  // Poll a job by ID
  const pollJob = useCallback(async (jobId: string) => {
    try {
      const res = await fetch(`/api/homepack/job/${jobId}`);
      if (!res.ok) {
        if (res.status === 404) {
          // Job expired or not found on server
          localStorage.removeItem(ACTIVE_JOB_KEY);
          setActiveJob(null);
        }
        return;
      }
      const data = await res.json();
      const updatedJob: HomePackJob = data.job;

      setActiveJob(updatedJob);

      if (updatedJob.status === 'completed') {
        localStorage.removeItem(ACTIVE_JOB_KEY);
        if (pollTimerRef.current) {
          clearInterval(pollTimerRef.current);
          pollTimerRef.current = null;
        }

        saveRecentReport(updatedJob);

        const addrLabel = `${updatedJob.address.houseNumber} ${updatedJob.address.street}`.trim() || updatedJob.address.postcode;
        toast.success(`HomePack for ${addrLabel} is ready!`, {
          description: 'All 7 property registers and AI dossier have been generated.',
          duration: 9000,
          action: {
            label: 'View Report',
            onClick: () => {
              setIsModalOpen(false);
              navigate('/tool', { state: { report: updatedJob.result, address: updatedJob.address } });
            }
          }
        });
      } else if (updatedJob.status === 'failed') {
        localStorage.removeItem(ACTIVE_JOB_KEY);
        if (pollTimerRef.current) {
          clearInterval(pollTimerRef.current);
          pollTimerRef.current = null;
        }
        toast.error(`HomePack generation failed`, {
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

  // Setup interval polling when activeJob is processing
  useEffect(() => {
    if (activeJob && activeJob.status === 'processing') {
      if (!pollTimerRef.current) {
        pollTimerRef.current = setInterval(() => {
          pollJob(activeJob.id);
        }, 1200);
      }
    } else {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    }

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [activeJob?.id, activeJob?.status, pollJob]);

  const startJob = async (address: Address): Promise<string> => {
    const res = await fetch('/api/homepack/start', {
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
    navigate('/tool', { state: { report, address, fromHistory } });
  };

  return (
    <HomePackJobContext.Provider
      value={{
        activeJob,
        isModalOpen,
        recentReports,
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
