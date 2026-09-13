import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useHomePackJob } from '@/contexts/HomePackJobContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, Calendar, Lock, Unlock, MapPin, Loader2, CheckCircle2, ArrowRight, Eye } from 'lucide-react';
import { SearchedAddress } from '../types';
import { useNavigate } from 'react-router-dom';

export default function HistoryPage() {
  const { user, profile } = useAuth();
  const { activeJob, openModal, recentReports, loadReport } = useHomePackJob();
  const navigate = useNavigate();

  const isLocked = (timestamp: string) => {
    if (profile?.role === 'admin' || profile?.role === 'agency') return false;
    
    const searchDate = new Date(timestamp);
    const oneYearLater = new Date(searchDate);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    return new Date() < oneYearLater;
  };

  const getUnlockDate = (timestamp: string) => {
    const searchDate = new Date(timestamp);
    const oneYearLater = new Date(searchDate);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    return oneYearLater.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (!user) return null;

  const history = profile?.searchHistory || [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-12 flex-grow space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">HomePack History</h1>
              <p className="text-sm text-muted-foreground">Track generated property packs, active background jobs, and access permissions.</p>
            </div>
          </div>
          <Button onClick={() => navigate('/tool')} className="rounded-full px-5">
            Create New HomePack
          </Button>
        </div>

        {/* Active In-Progress Job Card */}
        {activeJob && activeJob.status === 'processing' && (
          <Card className="border-primary/40 bg-primary/5 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 animate-pulse">
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Generating Now ({activeJob.progress}%)
                  </Badge>
                  <span className="text-xs text-muted-foreground font-medium">Background Job</span>
                </div>
                <Button size="sm" onClick={openModal} className="rounded-full px-4 text-xs">
                  View Live Checklist
                </Button>
              </div>
              <CardTitle className="text-lg mt-2">
                {activeJob.address.houseNumber} {activeJob.address.street}, {activeJob.address.town} ({activeJob.address.postcode})
              </CardTitle>
            </CardHeader>
          </Card>
        )}

        {/* Recently Compiled Packs with Instant View */}
        {recentReports.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Ready-to-View Completed HomePacks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentReports.map((saved) => (
                <Card 
                  key={saved.id} 
                  className="hover:border-primary/50 transition-all hover:shadow-md cursor-pointer group"
                  onClick={() => loadReport(saved.result, saved.address)}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                        Complete
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(saved.completedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <CardTitle className="text-base truncate group-hover:text-primary transition-colors">
                      {saved.address.houseNumber} {saved.address.street}
                    </CardTitle>
                    <CardDescription className="text-xs truncate">
                      {saved.address.town}, {saved.address.postcode}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">Full Dossier & PDF</span>
                    <div className="flex items-center text-xs font-semibold text-primary gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Open Pack</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Property Search Log</CardTitle>
            <CardDescription>
              Record of all searches conducted under your account.
              {profile?.role !== 'admin' && profile?.role !== 'agency' && (
                <span className="block mt-1 text-sm text-muted-foreground">
                  Note: Properties are locked for 1 year from the search date for {profile?.role} users.
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No search history found.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property Address</TableHead>
                    <TableHead>Search Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Unlock Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...history].reverse().map((item, index) => {
                    const locked = isLocked(item.timestamp);
                    const matchingSaved = recentReports.find(r => 
                      item.address.toLowerCase().includes(r.address.postcode.toLowerCase()) ||
                      r.addressString.toLowerCase() === item.address.toLowerCase()
                    );

                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.address}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(item.timestamp).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          {locked ? (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                              <Lock className="h-3 w-3 mr-1" />
                              Locked
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                              <Unlock className="h-3 w-3 mr-1" />
                              Available
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {locked ? getUnlockDate(item.timestamp) : 'Now'}
                        </TableCell>
                        <TableCell className="text-right">
                          {matchingSaved ? (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 text-xs gap-1.5"
                              onClick={() => loadReport(matchingSaved.result, matchingSaved.address)}
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View Pack
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">Logged</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
