import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Loader2, 
  Circle, 
  X, 
  Minimize2, 
  ArrowRight, 
  Building2,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useHomePackJob } from '@/contexts/HomePackJobContext';

interface HomePackChecklistModalProps {
  onViewReport?: () => void;
}

export function HomePackChecklistModal({ onViewReport }: HomePackChecklistModalProps) {
  const { activeJob, isModalOpen, closeModal, dismissActiveJob } = useHomePackJob();

  if (!isModalOpen || !activeJob) return null;

  const { address, status, progress, steps, error } = activeJob;
  const addressString = `${address.houseNumber} ${address.street}, ${address.town}, ${address.postcode}`.trim();
  const completedCount = steps.filter(s => s.status === 'completed').length;
  const totalCount = steps.length;
  const isCompleted = status === 'completed';
  const isFailed = status === 'failed';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="relative w-full max-w-xl bg-card border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col"
        >
          {/* Header Bar */}
          <div className="px-6 pt-6 pb-4 border-b border-border/60 flex items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1 pr-2">
              <div className="flex items-center gap-2">
                {isCompleted ? (
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-semibold py-0.5 px-2.5">
                    <FileCheck className="h-3.5 w-3.5 mr-1" />
                    Dossier Complete
                  </Badge>
                ) : isFailed ? (
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-xs font-semibold py-0.5 px-2.5">
                    <AlertCircle className="h-3.5 w-3.5 mr-1" />
                    Compilation Issue
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold py-0.5 px-2.5 animate-pulse">
                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                    Querying Registers
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground font-medium">
                  {completedCount} of {totalCount} checks complete
                </span>
              </div>

              <h2 className="text-xl font-bold tracking-tight text-foreground">
                {isCompleted ? "Your HomePack is Ready" : "Compiling Property HomePack"}
              </h2>

              <p className="text-sm text-muted-foreground line-clamp-1 font-medium flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                {addressString}
              </p>
            </div>

            {/* Minimize / Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 -mr-1"
              onClick={closeModal}
              title="Run in background"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar Section */}
          <div className="px-6 py-3 bg-muted/30 border-b border-border/40">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-1.5">
              <span>{isCompleted ? "100% Complete" : `${progress}% Complete`}</span>
              <span>
                {isCompleted 
                  ? "Verified Official Records" 
                  : completedCount < 3 
                    ? "~8 seconds remaining" 
                    : completedCount < 6 
                      ? "~4 seconds remaining" 
                      : "Finalizing summary..."}
              </span>
            </div>
            <Progress value={progress} className="h-2 rounded-full" />
          </div>

          {/* Checklist Items */}
          <div className="px-6 py-5 space-y-3 max-h-[380px] overflow-y-auto">
            {steps.map((step) => {
              const isStepDone = step.status === 'completed';
              const isStepCurrent = step.status === 'in_progress';
              const isStepPending = step.status === 'pending';
              const isStepFailed = step.status === 'failed';

              return (
                <div
                  key={step.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
                    isStepCurrent
                      ? "bg-primary/5 border-primary/30 shadow-xs"
                      : isStepDone
                      ? "bg-card border-border/60 hover:border-border"
                      : "bg-muted/15 border-transparent opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    {/* Status Icon */}
                    <div className="shrink-0">
                      {isStepDone && (
                        <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                      )}
                      {isStepCurrent && (
                        <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-primary">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        </div>
                      )}
                      {isStepPending && (
                        <div className="w-6 h-6 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground/50">
                          <Circle className="h-3.5 w-3.5" />
                        </div>
                      )}
                      {isStepFailed && (
                        <div className="w-6 h-6 rounded-full bg-destructive/15 flex items-center justify-center text-destructive">
                          <AlertCircle className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>

                    {/* Stage Label */}
                    <span
                      className={`text-sm tracking-tight truncate ${
                        isStepCurrent
                          ? "font-semibold text-foreground"
                          : isStepDone
                          ? "font-medium text-foreground"
                          : "font-normal text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>

                  {/* Real-time Detail Badge if finished */}
                  {isStepDone && step.detail && (
                    <Badge
                      variant="secondary"
                      className="shrink-0 text-[11px] font-medium px-2 py-0.5 bg-muted text-muted-foreground max-w-[160px] truncate"
                    >
                      {step.detail}
                    </Badge>
                  )}

                  {isStepCurrent && (
                    <span className="shrink-0 text-[11px] font-medium text-primary animate-pulse">
                      Analyzing...
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Footer */}
          <div className="px-6 py-4 bg-muted/20 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground text-center sm:text-left">
              {isCompleted ? (
                "Official datasets compiled and verified."
              ) : (
                "You can continue browsing the site. Your progress is saved."
              )}
            </p>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {isCompleted ? (
                <Button
                  onClick={() => {
                    closeModal();
                    if (onViewReport) {
                      onViewReport();
                    }
                  }}
                  className="w-full sm:w-auto rounded-xl px-5 h-10 shadow-sm"
                >
                  <span>View HomePack Report</span>
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              ) : isFailed ? (
                <Button
                  variant="outline"
                  onClick={dismissActiveJob}
                  className="w-full sm:w-auto rounded-xl h-10"
                >
                  Dismiss
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={closeModal}
                  className="w-full sm:w-auto rounded-xl h-10 border-border font-medium hover:bg-muted"
                >
                  <span>Run in Background</span>
                  <Minimize2 className="ml-1.5 h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
