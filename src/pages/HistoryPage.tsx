import { PageHero } from '@/components/layout/PageHero';
import { useAuth } from '../contexts/AuthContext';
import { useHomePackJob } from '@/contexts/HomePackJobContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, Loader2, Eye, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function HistoryPage() {
  const { user } = useAuth();
  const { activeJob, openModal, recentReports, openSavedReport, historyLoading, historyError, hasMoreReports, refreshReports, loadMoreReports } = useHomePackJob();
  const navigate = useNavigate();
  return <div className="min-h-screen bg-background flex flex-col"><Header />
    <main className="site-main container mx-auto flex-grow space-y-6">
      <PageHero eyebrow="Your property workspace" icon={<History />}>
        <h1 className="site-page-heading">Your property report history</h1>
        <p>{user ? 'Open your saved reports on any device. Each property shows its latest saved report for the selected planning scope.' : 'Sign in to access your saved property reports.'}</p>
        {user ? <Button asChild className="mt-5"><Link to="/tool" state={{ startNewHomePack: true }}>Create a new property report</Link></Button> : <Button className="mt-5" onClick={() => navigate('/tool')}>Sign in to view your history</Button>}
      </PageHero>
      {user && <>
        {activeJob?.status === 'processing' && <Card><CardHeader><CardTitle>Generating your report ({activeJob.progress}%)</CardTitle></CardHeader><CardContent><Button onClick={openModal}>View live checklist</Button></CardContent></Card>}
        <Card><CardHeader className="flex flex-row justify-between gap-4"><div><CardTitle>Saved property reports</CardTitle><CardDescription>Reports are saved to your account after successful generation. New reports replace the previous version for the same property and planning scope.</CardDescription></div><Button variant="outline" disabled={historyLoading} onClick={() => void refreshReports()}>Refresh</Button></CardHeader>
          <CardContent className="space-y-3">
            {historyError && <p role="alert" className="text-sm text-destructive">{historyError} Use Refresh to try again.</p>}
            {historyLoading && <p role="status" className="flex items-center gap-2 text-muted-foreground text-sm"><Loader2 className="h-4 w-4 animate-spin" />Loading saved reports…</p>}
            {!historyLoading && !historyError && recentReports.length === 0 && <div className="py-10 text-center text-muted-foreground"><MapPin className="h-10 w-10 mx-auto mb-3" /><p>No completed reports yet.</p></div>}
            {recentReports.map(report => <div key={report.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"><div className="min-w-0"><p className="font-semibold text-sm break-words">{report.addressString}</p><p className="text-xs text-muted-foreground mt-1">{new Date(report.completedAt).toLocaleDateString('en-GB')} · {report.result ? 'Legacy copy on this device' : 'Saved to your account'}{report.planningScope === 'radius' ? ' · Nearby planning' : ''}</p></div><Button size="sm" variant="outline" onClick={() => void openSavedReport(report, true)}><Eye className="h-4 w-4" />View report</Button></div>)}
            {hasMoreReports && <Button variant="outline" disabled={historyLoading} onClick={() => void loadMoreReports()}>Load older reports</Button>}
          </CardContent>
        </Card>
      </>}
    </main><Footer /></div>;
}
