import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

// The previous version simulated 2FA (hardcoded secret, demo code 123456) and showed
// "enabled" without protecting anything. Until real MFA is wired to Supabase Auth
// (supabase.auth.mfa.enroll / challenge / verify with TOTP), this panel says so plainly.
const TwoFactorAuth: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-amber-500" />
          Two-factor authentication
        </CardTitle>
        <CardDescription>Not available yet.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>
          Admin accounts are currently protected by password or Google sign-in only. Use a strong, unique
          password, or sign in with a Google account that has two-step verification turned on.
        </p>
        <p>Authenticator-app (TOTP) verification through Supabase Auth is planned.</p>
      </CardContent>
    </Card>
  );
};

export default TwoFactorAuth;
