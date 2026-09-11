import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, LogOut, User, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { logout } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoginDialog } from '@/components/auth/LoginDialog';

export function HomePackHeader() {
  const { user, profile, isAdmin } = useAuth();

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-1.5 bg-primary rounded-md">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">HomePack</span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm" className="text-primary">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-muted rounded-full">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <Link to="/profile" className="text-xs font-medium hover:text-primary transition-colors">
                    {profile?.displayName || user.displayName}
                  </Link>
                  <Badge variant="outline" className="text-[10px] h-4 px-1 capitalize">
                    {profile?.role || 'free'}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={logout} title="Logout">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <LoginDialog trigger={<Button size="sm">Login</Button>} />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
