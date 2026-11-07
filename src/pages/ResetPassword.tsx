import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';
import { validatePasswordStrength } from '@/utils/security';

type Status = 'checking' | 'ready' | 'invalid';

/**
 * Landing page for the password-reset email. Supabase signs the visitor in with a
 * short-lived recovery session from the link; this page lets them choose a new password.
 */
const ResetPassword = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let settled = false;
    const markReady = () => {
      settled = true;
      setStatus('ready');
    };

    // The link may carry an error instead of a session (expired or already used).
    const params = new URLSearchParams(window.location.hash.slice(1) || window.location.search);
    if (params.get('error') || params.get('error_code')) {
      setStatus('invalid');
      return;
    }

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        markReady();
      }
    });
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) markReady();
    });
    // Give the client a moment to read the token from the link before giving up.
    const timer = window.setTimeout(() => {
      if (!settled) setStatus('invalid');
    }, 5000);

    return () => {
      sub.subscription.unsubscribe();
      window.clearTimeout(timer);
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid, errors: found } = validatePasswordStrength(password);
    if (!isValid) {
      setErrors(found);
      return;
    }
    if (password !== confirm) {
      setErrors(['The two passwords do not match']);
      return;
    }
    setErrors([]);
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Your password has been changed.');
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Lock className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Choose a new password</CardTitle>
        </CardHeader>
        <CardContent>
          {status === 'checking' && (
            <p className="text-center text-muted-foreground" role="status">
              Checking your reset link…
            </p>
          )}

          {status === 'invalid' && (
            <div className="space-y-4 text-center">
              <p className="text-muted-foreground">
                This reset link has expired or has already been used. Request a new one and use the most recent email.
              </p>
              <Button asChild className="w-full">
                <Link to="/auth">Back to sign in</Link>
              </Button>
            </div>
          )}

          {status === 'ready' && (
            <form onSubmit={submit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
              {errors.length > 0 && (
                <ul className="space-y-1 text-sm text-destructive" role="alert">
                  {errors.map((err) => (
                    <li key={err}>• {err}</li>
                  ))}
                </ul>
              )}
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? 'Saving…' : 'Save new password'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
