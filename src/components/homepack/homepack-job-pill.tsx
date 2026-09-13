import React from 'react';
import { Loader2, CheckCircle2, Building2, ChevronRight, X } from 'lucide-react';
import { useHomePackJob } from '@/contexts/HomePackJobContext';
import { useNavigate } from 'react-router-dom';

export function HomePackJobHeaderPill() {
  const { activeJob, openModal, dismissActiveJob } = useHomePackJob();
  const navigate = useNavigate();

  if (!activeJob) return null;

  const isCompleted = activeJob.status === 'completed';
  const isFailed = activeJob.status === 'failed';
  const addrLabel = `${activeJob.address.houseNumber} ${activeJob.address.street}`.trim() || activeJob.address.postcode;

  if (isFailed) return null;

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => {
          if (isCompleted && activeJob.result) {
            navigate('/tool', { state: { report: activeJob.result, address: activeJob.address } });
          } else {
            openModal();
          }
        }}
        className={`group flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 shadow-xs ${
          isCompleted
            ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
            : "bg-primary/10 hover:bg-primary/15 text-primary border-primary/25 animate-pulse"
        }`}
      >
        {isCompleted ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        ) : (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
        )}

        <span className="truncate max-w-[130px] sm:max-w-[170px]">
          {isCompleted ? `Ready: ${addrLabel}` : `${addrLabel} (${activeJob.progress}%)`}
        </span>

        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-background/60 text-foreground/80 shrink-0">
          {isCompleted ? "View" : "Details"}
        </span>
      </button>

      {isCompleted && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            dismissActiveJob();
          }}
          className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
          title="Dismiss banner"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

export function HomePackFloatingPill() {
  const { activeJob, isModalOpen, openModal, dismissActiveJob } = useHomePackJob();
  const navigate = useNavigate();

  // If modal is open or no active job, do not show floating pill
  if (!activeJob || isModalOpen) return null;

  const isCompleted = activeJob.status === 'completed';
  const isFailed = activeJob.status === 'failed';
  if (isFailed) return null;

  const addrLabel = `${activeJob.address.houseNumber} ${activeJob.address.street}`.trim() || activeJob.address.postcode;

  return (
    <div className="fixed bottom-5 right-5 z-40 animate-fade-in-up">
      <div className={`flex items-center gap-2 p-2 pr-3 rounded-2xl shadow-xl border backdrop-blur-md transition-all ${
        isCompleted
          ? "bg-card/95 border-emerald-500/30 text-card-foreground"
          : "bg-card/95 border-primary/30 text-card-foreground"
      }`}>
        <button
          onClick={() => {
            if (isCompleted && activeJob.result) {
              navigate('/tool', { state: { report: activeJob.result, address: activeJob.address } });
            } else {
              openModal();
            }
          }}
          className="flex items-center gap-3 text-left group"
        >
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            isCompleted 
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" 
              : "bg-primary/15 text-primary"
          }`}>
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <Loader2 className="h-5 w-5 animate-spin" />
            )}
          </div>

          <div className="flex flex-col min-w-0 pr-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold tracking-tight truncate max-w-[170px]">
                {isCompleted ? "HomePack Complete" : "Compiling HomePack"}
              </span>
              {!isCompleted && (
                <span className="text-[11px] font-semibold text-primary">
                  {activeJob.progress}%
                </span>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground truncate max-w-[190px]">
              {addrLabel}
            </span>
          </div>

          <div className="p-1 rounded-lg bg-muted text-muted-foreground group-hover:text-foreground group-hover:bg-muted/80 transition-colors shrink-0">
            <ChevronRight className="h-4 w-4" />
          </div>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            dismissActiveJob();
          }}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted shrink-0"
          title="Dismiss notification"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
