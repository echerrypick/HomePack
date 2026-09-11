import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { History, Calendar, Lock, Unlock, MapPin } from 'lucide-react';
import { SearchedAddress } from '../types';

export default function HistoryPage() {
  const { user, profile } = useAuth();

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
      <main className="container mx-auto px-4 py-12 flex-grow">
        <div className="flex items-center gap-3 mb-8">
          <History className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">HomePack History</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Property Search History</CardTitle>
            <CardDescription>
              List of properties you have searched for. 
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...history].reverse().map((item, index) => {
                    const locked = isLocked(item.timestamp);
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
