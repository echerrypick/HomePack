import { PageHero } from '@/components/layout/PageHero';
import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db, UserRole, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { toast } from 'sonner';
import { Shield, Users, Activity, Settings, FileText, TicketPercent, Copy, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { billingRequest } from '@/lib/billing-client';

type PromoCodeRecord = {
  id: string;
  code: string;
  kind?: 'free' | 'discount';
  discountPercent?: number;
  status: 'available' | 'reserved' | 'claimed';
  createdAt: string;
  claimedAt?: string;
  claimedByEmail?: string;
  reservedByEmail?: string;
  address?: string;
};

export default function AdminPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoCodes, setPromoCodes] = useState<PromoCodeRecord[]>([]);
  const [promoLoading, setPromoLoading] = useState(true);
  const [creatingPromo, setCreatingPromo] = useState(false);
  const [promoKind, setPromoKind] = useState<'free' | 'discount'>('free');
  const [discountPercent, setDiscountPercent] = useState('20');
  const [customCode, setCustomCode] = useState('');
  const [codeQuantity, setCodeQuantity] = useState('1');
  const [promoTestMode, setPromoTestMode] = useState(false);

  const loadPromoCodes = async () => {
    setPromoLoading(true);
    try {
      const result = await billingRequest('/api/admin/promo-codes');
      setPromoCodes(result.codes || []);
      setPromoTestMode(Boolean(result.testMode));
    } catch (error: any) {
      toast.error(error.message || 'Unable to load report codes');
    } finally {
      setPromoLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;

    void loadPromoCodes();

    const path = 'users';
    const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
      const userData = snapshot.docs.map(doc => doc.data() as UserProfile);
      setUsers(userData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      setLoading(false);
    });

    return unsubscribe;
  }, [isAdmin]);

  const handleCreatePromoCodes = async () => {
    setCreatingPromo(true);
    try {
      const result = await billingRequest('/api/admin/promo-codes', {
        kind: promoKind,
        discountPercent: promoKind === 'discount' ? Number(discountPercent) : 100,
        code: customCode.trim() || undefined,
        quantity: customCode.trim() ? 1 : Number(codeQuantity),
      });
      toast.success(`${result.codes.length} ${promoKind === 'free' ? 'free-report' : `${discountPercent}%-off`} code${result.codes.length === 1 ? '' : 's'} created`);
      setCustomCode('');
      await loadPromoCodes();
    } catch (error: any) {
      toast.error(error.message || 'Unable to create report codes');
    } finally {
      setCreatingPromo(false);
    }
  };

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    toast.success('Code copied');
  };

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    const path = `users/${uid}`;
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      toast.error("Failed to update user role");
    }
  };

  if (authLoading) return <div className="min-h-screen flex flex-col"><Header /><main className="site-main flex-grow" role="status">Loading account permissions…</main><Footer /></div>;
  if (!isAdmin) return <div className="min-h-screen flex flex-col"><Header /><main className="site-main container flex-grow"><PageHero eyebrow="Account permissions" illustration="simple" icon={<Shield />}><h1 className="site-page-heading">Administrator access required</h1><p>This area is restricted to authorised administrators.</p><Button asChild className="mt-5"><Link to="/profile">Return to your account</Link></Button></PageHero></main><Footer /></div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="site-main container mx-auto px-4 py-12 flex-grow">
        <PageHero eyebrow="Administration" illustration="simple" icon={<Shield />}><h1 className="site-page-heading">Admin dashboard</h1><p>Review users, membership records and property-report activity.</p></PageHero>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === 'subscription' || u.role === 'agency').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Operational</Badge>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><TicketPercent className="h-5 w-5 text-primary" />Report offer codes</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">Create single-use codes for a free report or a percentage discount. Every code is tied to the property selected when it is claimed.</p>
              </div>
              {promoTestMode && <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">Stripe sandbox codes</Badge>}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 rounded-xl border bg-muted/20 p-4 md:grid-cols-5 md:items-end">
              <label className="space-y-1.5 text-sm font-medium">
                Offer type
                <Select value={promoKind} onValueChange={value => setPromoKind(value as 'free' | 'discount')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free report</SelectItem>
                    <SelectItem value="discount">Percentage off</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              <label className="space-y-1.5 text-sm font-medium">
                Discount
                <Input type="number" min="1" max="99" disabled={promoKind !== 'discount'} value={discountPercent} onChange={event => setDiscountPercent(event.target.value)} />
              </label>
              <label className="space-y-1.5 text-sm font-medium md:col-span-2">
                Custom code <span className="font-normal text-muted-foreground">(optional)</span>
                <Input value={customCode} onChange={event => setCustomCode(event.target.value.toUpperCase())} placeholder="Leave blank to generate securely" maxLength={32} />
              </label>
              <label className="space-y-1.5 text-sm font-medium">
                Quantity
                <Input type="number" min="1" max="50" disabled={Boolean(customCode.trim())} value={codeQuantity} onChange={event => setCodeQuantity(event.target.value)} />
              </label>
              <Button className="md:col-span-5 md:w-fit" disabled={creatingPromo} onClick={handleCreatePromoCodes}>
                <Plus className="h-4 w-4" />{creatingPromo ? 'Creating…' : 'Create code(s)'}
              </Button>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              {([
                { title: 'Created — not claimed', records: promoCodes.filter(code => code.status !== 'claimed') },
                { title: 'Claimed', records: promoCodes.filter(code => code.status === 'claimed') },
              ] as const).map(group => (
                <div key={group.title} className="min-w-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{group.title}</h3>
                    <Badge variant="secondary">{group.records.length}</Badge>
                  </div>
                  <div className="max-h-96 space-y-2 overflow-y-auto rounded-xl border p-2">
                    {promoLoading ? <p className="p-4 text-sm text-muted-foreground">Loading codes…</p> : group.records.length === 0 ? <p className="p-4 text-sm text-muted-foreground">No codes in this group.</p> : group.records.map(record => (
                      <div key={record.id} className="rounded-lg border bg-card p-3 text-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono font-bold tracking-wide">{record.code}</span>
                              <Badge variant={record.status === 'claimed' ? 'secondary' : 'outline'}>{record.kind === 'discount' ? `${record.discountPercent}% off` : 'Free report'}</Badge>
                              {record.status === 'reserved' && <Badge variant="outline" className="border-amber-300 text-amber-700">Checkout pending</Badge>}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">Created {new Date(record.createdAt).toLocaleString('en-GB')}</p>
                          </div>
                          <Button size="icon-sm" variant="ghost" aria-label={`Copy ${record.code}`} onClick={() => copyCode(record.code)}><Copy className="h-4 w-4" /></Button>
                        </div>
                        {record.address && <p className="mt-2 break-words text-xs"><span className="font-semibold">Property:</span> {record.address}</p>}
                        {(record.claimedByEmail || record.reservedByEmail) && <p className="mt-1 break-all text-xs"><span className="font-semibold">Customer:</span> {record.claimedByEmail || record.reservedByEmail}</p>}
                        {record.claimedAt && <p className="mt-1 text-xs text-muted-foreground">Claimed {new Date(record.claimedAt).toLocaleString('en-GB')}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Searches</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell className="font-medium">{user.displayName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.searchCount}</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog>
                          <DialogTrigger render={
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-2" />
                              Reports
                            </Button>
                          } />
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Reports for {user.displayName}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              {user.propertyReportCounts && Object.keys(user.propertyReportCounts).length > 0 ? (
                                <div className="grid gap-2">
                                  {Object.entries(user.propertyReportCounts).map(([address, count]) => (
                                    <div key={address} className="flex justify-between items-center p-3 bg-muted rounded-lg text-sm">
                                      <span className="truncate mr-4 font-medium">{address.replace(/_/g, '.')}</span>
                                      <Badge variant="secondary" className="shrink-0">{count} reports</Badge>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-center text-muted-foreground py-8">No reports generated yet.</p>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Select 
                          value={user.role} 
                          onValueChange={(value) => handleRoleChange(user.uid, value as UserRole)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Change Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="subscription">Subscription</SelectItem>
                            <SelectItem value="agency">Agency</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
