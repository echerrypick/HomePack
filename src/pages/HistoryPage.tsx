import { PageHero } from '@/components/layout/PageHero';
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useHomePackJob } from '@/contexts/HomePackJobContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, Calendar, Lock, Unlock, MapPin, Loader2, Eye } from 'lucide-react';
import { SearchedAddress } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { ownsProperty, propertyKey } from '@/lib/plans';

export default function HistoryPage() {
  const { user, profile } = useAuth();
  const { activeJob, openModal, recentReports, loadReport } = useHomePackJob();
  const navigate = useNavigate();

  const isLocked = (timestamp: string) => {
    return false;
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

  if (!user) return <div className="min-h-screen flex flex-col"><Header /><main className="site-main container mx-auto px-4 py-20 flex-grow"><PageHero eyebrow="Your property workspace" icon={<History />}><h1 className="site-page-heading">Your reports, all in one place.</h1><p>Sign in to revisit your property searches and reports saved in this browser.</p><Button className="mt-6" onClick={() => navigate('/tool')}>Sign in to view your history</Button></PageHero></main><Footer /></div>;

  const history = profile?.searchHistory || [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="site-main container mx-auto px-4 py-12 flex-grow space-y-8">
        <PageHero eyebrow="Your property workspace" icon={<History />}><h1 className="site-page-heading">Your property report history</h1><p>Revisit your searches, follow active reports and reopen reports saved in this browser.</p><Button asChild className="mt-5"><Link to="/tool" state={{ startNewHomePack: true }}>Create a new property report</Link></Button></PageHero>

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

        <Card>
          <CardHeader>
            <CardTitle>All Property Search Log</CardTitle>
            <CardDescription>
              Record of all searches conducted under your account.
              {profile?.role !== 'admin' && profile?.role !== 'agency' && (
                <span className="block mt-1 text-sm text-muted-foreground">
                  Each £9.99 purchase covers one property. Reports saved in this browser can be reopened below.
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
                              onClick={() => loadReport(matchingSaved.result, matchingSaved.address, true)}
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
