
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { QrCode, KeyRound, Check, X, Shield, Clock, Smartphone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

const TwoFactorAuth: React.FC = () => {
  const { session } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [setupMode, setSetupMode] = useState(false);
  const [verifyMode, setVerifyMode] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secretKey, setSecretKey] = useState('');

  const handleEnableToggle = async () => {
    if (enabled) {
      // Confirm 2FA disable
      const confirm = window.confirm('Are you sure you want to disable two-factor authentication? This will reduce the security of your account.');
      if (!confirm) return;
      
      setLoading(true);
      try {
        // In a real app, we would call an API to disable 2FA
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        setEnabled(false);
        toast.success('Two-factor authentication disabled');
      } catch (error: any) {
        toast.error(`Failed to disable 2FA: ${error.message}`);
      } finally {
        setLoading(false);
      }
    } else {
      // Start 2FA setup process
      setSetupMode(true);
      await generateQrCode();
    }
  };
  
  const generateQrCode = async () => {
    setLoading(true);
    try {
      // In a real app, we would call an API to generate a secret and QR code
      // For demo, simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a mock secret (in real app, this would be generated on the server)
      const mockSecret = 'ABCDEFGHIJKLMNOP';
      setSecretKey(mockSecret);
      
      // Generate a mock QR code URL
      // In real app, this would be a proper QR code URL for an authenticator app
      setQrCodeUrl('https://via.placeholder.com/200x200.png?text=Sample+QR+Code');
      
      // Generate mock backup codes
      const mockBackupCodes = Array.from({ length: 8 }, () => 
        Math.random().toString(36).substring(2, 8).toUpperCase()
      );
      setBackupCodes(mockBackupCodes);
    } catch (error: any) {
      toast.error(`Failed to generate QR code: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerify = async () => {
    if (otpValue.length !== 6) return;
    
    setLoading(true);
    try {
      // In a real app, we would call an API to verify the OTP
      // For demo, simulate verification (any 6-digit code works)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, consider the OTP "123456" as valid
      if (otpValue === '123456') {
        setEnabled(true);
        setSetupMode(false);
        setVerifyMode(false);
        toast.success('Two-factor authentication enabled');
      } else {
        toast.error('Invalid verification code. Try 123456 for demo.');
      }
    } catch (error: any) {
      toast.error(`Failed to verify: ${error.message}`);
    } finally {
      setLoading(false);
      setOtpValue('');
    }
  };
  
  const cancelSetup = () => {
    setSetupMode(false);
    setVerifyMode(false);
    setOtpValue('');
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };
  
  if (setupMode && !verifyMode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Shield className="h-5 w-5 mr-2 text-primary" />
            Set Up Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Scan the QR code or enter the secret key in your authenticator app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="bg-muted p-4 rounded-md border border-border flex-shrink-0">
              {qrCodeUrl ? (
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  className="w-[200px] h-[200px]" 
                />
              ) : (
                <div className="w-[200px] h-[200px] flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="secret-key">Secret Key</Label>
                <div className="flex mt-1">
                  <Input 
                    id="secret-key" 
                    value={secretKey} 
                    readOnly 
                    className="font-mono"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-2" 
                    onClick={() => copyToClipboard(secretKey)}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  If you can't scan the QR code, enter this code manually into your authenticator app.
                </p>
              </div>
              
              <Alert>
                <AlertTitle className="flex items-center">
                  <KeyRound className="h-4 w-4 mr-2" />
                  Save your backup codes
                </AlertTitle>
                <AlertDescription>
                  <p className="mb-2 text-sm">
                    If you lose access to your authenticator app, you can use these backup codes to sign in. Each code can only be used once.
                  </p>
                  <div className="grid grid-cols-2 gap-2 my-3">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="font-mono text-xs bg-muted p-1 rounded text-center">
                        {code}
                      </div>
                    ))}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => copyToClipboard(backupCodes.join('\n'))}
                  >
                    Copy All Codes
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={cancelSetup}>
              Cancel
            </Button>
            <Button onClick={() => setVerifyMode(true)}>
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (verifyMode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Shield className="h-5 w-5 mr-2 text-primary" />
            Verify Authentication Code
          </CardTitle>
          <CardDescription>
            Enter the 6-digit code from your authenticator app to complete setup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-center my-6">
              <InputOTP 
                maxLength={6} 
                value={otpValue} 
                onChange={(value) => setOtpValue(value)}
                render={({ slots }) => (
                  <InputOTPGroup>
                    {slots.map((slot, index) => (
                      <InputOTPSlot key={index} {...slot} index={index} />
                    ))}
                  </InputOTPGroup>
                )}
              />
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              <p>For this demo, use code: 123456</p>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={cancelSetup}>
                Cancel
              </Button>
              <Button 
                onClick={handleVerify} 
                disabled={otpValue.length !== 6 || loading}
              >
                {loading ? 'Verifying...' : 'Verify and Enable'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Shield className="h-5 w-5 mr-2 text-primary" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account by requiring a verification code
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="2fa-toggle">
                {enabled ? 'Two-factor authentication is enabled' : 'Two-factor authentication is disabled'}
              </Label>
              <p className="text-sm text-muted-foreground">
                {enabled 
                  ? 'Your account is protected with an authenticator app' 
                  : 'Protect your account with an authenticator app'}
              </p>
            </div>
            <Switch 
              id="2fa-toggle" 
              checked={enabled} 
              onCheckedChange={handleEnableToggle}
              disabled={loading}
            />
          </div>
          
          {enabled && (
            <div className="mt-6 space-y-4">
              <div className="bg-muted/50 p-4 rounded-md border border-border flex items-start space-x-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Authenticator App</h4>
                  <p className="text-sm text-muted-foreground">
                    You're using an authenticator app to generate verification codes.
                  </p>
                </div>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-md border border-border flex items-start space-x-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <KeyRound className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Backup Codes</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    You have backup codes that can be used if you lose access to your authenticator app.
                  </p>
                  <Button variant="outline" size="sm">
                    View Backup Codes
                  </Button>
                </div>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-md border border-border flex items-start space-x-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Last Used</h4>
                  <p className="text-sm text-muted-foreground">
                    2FA was last used on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {!enabled && (
            <div className="mt-6">
              <Alert>
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                  <div>
                    <AlertTitle>Increase your account security</AlertTitle>
                    <AlertDescription className="mt-1">
                      Two-factor authentication adds an additional layer of security to your account by requiring a verification code in addition to your password.
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TwoFactorAuth;
