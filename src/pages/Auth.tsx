
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, Lock, User, ArrowLeft } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard');
      }
    });
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          toast.error('Passwords do not match');
          return;
        }
        if (password.length < 6) {
          toast.error('Password must be at least 6 characters');
          return;
        }

        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });
        
        if (error) throw error;
        toast.success('Account created! Please check your email to verify your account.');
      } else if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Welcome back!');
        navigate('/dashboard');
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`
        });
        if (error) throw error;
        toast.success('Password reset email sent!');
        setMode('login');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/50 px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                {mode === 'login' ? <Mail className="h-6 w-6 text-primary" /> :
                 mode === 'signup' ? <User className="h-6 w-6 text-primary" /> :
                 <Lock className="h-6 w-6 text-primary" />}
              </div>
            </div>
            <CardTitle className="text-2xl">
              {mode === 'login' ? 'Welcome Back' :
               mode === 'signup' ? 'Create Account' :
               'Reset Password'}
            </CardTitle>
            <p className="text-muted-foreground">
              {mode === 'login' ? 'Sign in to continue your learning journey' :
               mode === 'signup' ? 'Sign up to start your learning journey' :
               'Enter your email to reset your password'}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {mode !== 'reset' && (
                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              )}
              {mode === 'signup' && (
                <div>
                  <Input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Loading...' : 
                 mode === 'login' ? 'Sign In' :
                 mode === 'signup' ? 'Create Account' :
                 'Send Reset Email'}
              </Button>
            </form>

            <div className="mt-6 space-y-2">
              {mode === 'login' && (
                <>
                  <button
                    onClick={() => setMode('signup')}
                    className="w-full text-sm text-muted-foreground hover:text-primary"
                  >
                    Don't have an account? Sign up
                  </button>
                  <button
                    onClick={() => setMode('reset')}
                    className="w-full text-sm text-muted-foreground hover:text-primary"
                  >
                    Forgot your password?
                  </button>
                </>
              )}
              {mode === 'signup' && (
                <button
                  onClick={() => setMode('login')}
                  className="w-full text-sm text-muted-foreground hover:text-primary"
                >
                  Already have an account? Sign in
                </button>
              )}
              {mode === 'reset' && (
                <button
                  onClick={() => setMode('login')}
                  className="w-full text-sm text-muted-foreground hover:text-primary flex items-center justify-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to sign in
                </button>
              )}
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/')}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Continue as guest
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
