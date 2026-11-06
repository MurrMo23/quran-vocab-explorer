import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ExternalLink, RefreshCw } from 'lucide-react';

const SUPABASE_PROJECT_REF = 'ozacrpxnfywmueasbhbm';
const LOVABLE_PROJECT_URL = 'https://lovable.dev/projects/eeec545d-93ac-452f-af2b-0cca7168d27b';

type Check = { state: 'idle' | 'checking' | 'ok' | 'warn' | 'error'; detail: string };

const tone: Record<Check['state'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
  idle: 'outline',
  checking: 'outline',
  ok: 'default',
  warn: 'secondary',
  error: 'destructive',
};
const label: Record<Check['state'], string> = {
  idle: 'Not checked',
  checking: 'Checking…',
  ok: 'OK',
  warn: 'Needs setup',
  error: 'Problem',
};

const Row = ({ title, check, action }: { title: string; check: Check; action?: React.ReactNode }) => (
  <div className="flex flex-col gap-2 border-b py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{check.detail}</p>
    </div>
    <div className="flex items-center gap-2">
      <Badge variant={tone[check.state]}>{label[check.state]}</Badge>
      {action}
    </div>
  </div>
);

/** Real system status for admins. Every value here is measured or read, never assumed. */
const AdminSystem = () => {
  const [db, setDb] = useState<Check>({ state: 'idle', detail: '' });
  const [email, setEmail] = useState<Check>({
    state: 'idle',
    detail: 'Checks whether the contact-form email alert has its Resend settings.',
  });

  const checkDb = useCallback(async () => {
    setDb({ state: 'checking', detail: '' });
    const started = performance.now();
    const { error } = await supabase.from('content_pages').select('id', { count: 'exact', head: true });
    const ms = Math.round(performance.now() - started);
    setDb(
      error
        ? { state: 'error', detail: `Database request failed: ${error.message}` }
        : { state: 'ok', detail: `Database responded in ${ms} ms.` },
    );
  }, []);

  const checkEmail = useCallback(async () => {
    setEmail({ state: 'checking', detail: '' });
    // A random id never matches a message, so this sends nothing; the response only
    // tells us whether the function has its Resend secrets.
    const { data, error } = await supabase.functions.invoke('notify-contact', {
      body: { id: crypto.randomUUID() },
    });
    if (error) {
      setEmail({ state: 'error', detail: 'The notify-contact function did not respond correctly.' });
    } else if (data?.reason === 'not_configured') {
      setEmail({
        state: 'warn',
        detail:
          'Messages are saved to the Inbox, but no alert emails are sent. Add RESEND_API_KEY and CONTACT_NOTIFY_TO in Supabase → Edge Functions → Secrets.',
      });
    } else {
      setEmail({ state: 'ok', detail: 'Configured: each new contact message triggers one alert email.' });
    }
  }, []);

  useEffect(() => {
    void checkDb();
  }, [checkDb]);

  const built = new Date(__BUILD_TIME__);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
          <CardDescription>Live checks run from your browser.</CardDescription>
        </CardHeader>
        <CardContent>
          <Row
            title="Database"
            check={db}
            action={
              <Button variant="ghost" size="icon" onClick={() => void checkDb()} aria-label="Re-check database">
                <RefreshCw className="h-4 w-4" />
              </Button>
            }
          />
          <Row
            title="Contact email alerts"
            check={email}
            action={
              <Button variant="outline" size="sm" onClick={() => void checkEmail()} disabled={email.state === 'checking'}>
                Check
              </Button>
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>This version</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Built</p>
            <p className="font-medium">{isNaN(built.getTime()) ? 'Unknown' : built.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Commit</p>
            <p className="font-mono">{__BUILD_COMMIT__ || 'Not recorded'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Managed elsewhere</CardTitle>
          <CardDescription>
            Backups, auth settings, secrets and publishing are handled by Supabase and Lovable, not this panel.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {[
            ['Database backups', `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/database/backups/scheduled`],
            ['Auth & accounts', `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/auth/users`],
            ['Function secrets', `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/functions/secrets`],
            ['Security advisor', `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/advisors/security`],
            ['Lovable project', LOVABLE_PROJECT_URL],
          ].map(([name, href]) => (
            <Button key={name} variant="outline" size="sm" asChild>
              <a href={href} target="_blank" rel="noopener noreferrer">
                {name}
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSystem;
