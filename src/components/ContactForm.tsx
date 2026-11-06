import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Send, CheckCircle, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  /** Honeypot: real users never see or fill this. */
  website: string;
}

const EMPTY: ContactFormData = { name: '', email: '', subject: '', category: '', message: '', website: '' };

const CATEGORIES = [
  { value: 'content-error', label: 'Report a content error' },
  { value: 'technical', label: 'Technical problem' },
  { value: 'account', label: 'Account or data request' },
  { value: 'feedback', label: 'Feedback or suggestion' },
  { value: 'general', label: 'Something else' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>(EMPTY);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const name = formData.name.trim();
    const email = formData.email.trim();
    const message = formData.message.trim();

    if (!name || !email || !message) {
      toast.error('Please fill in your name, email and message.');
      return;
    }
    if (!EMAIL_RE.test(email)) {
      toast.error('Please enter a valid email address so we can reply.');
      return;
    }
    if (message.length > 5000) {
      toast.error('Please keep your message under 5,000 characters.');
      return;
    }

    // Bots fill hidden fields; pretend success and drop it.
    if (formData.website) {
      setIsSubmitted(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      // `contact_messages` is created by migration 20261106130000_honest_content_pages.sql.
      // It is not yet in the generated Supabase types, hence the narrow cast.
      const { error } = await (supabase as unknown as {
        from: (t: string) => { insert: (row: Record<string, unknown>) => Promise<{ error: unknown }> };
      })
        .from('contact_messages')
        .insert({
          name: name.slice(0, 200),
          email: email.slice(0, 320),
          subject: formData.subject.trim().slice(0, 300) || null,
          category: formData.category || 'general',
          message,
          page_url: typeof window !== 'undefined' ? window.location.href.slice(0, 500) : null,
          user_id: session?.user?.id ?? null,
        });

      if (error) throw error;

      setIsSubmitted(true);
      setFormData(EMPTY);
      toast.success('Thanks — your message has been sent.');
    } catch (error) {
      console.error('Contact form submission failed:', error);
      setSubmitError(
        'Sorry, your message could not be sent right now. Please try again in a few minutes. ' +
        'If it keeps failing, copy your message somewhere safe so you do not lose it.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold">Message sent</h3>
            <p className="text-muted-foreground max-w-md">
              Thank you for getting in touch. QuranVocab is run by a small independent team, so replies can take a
              few days. We will reply to the email address you gave us.
            </p>
            <Button variant="outline" onClick={() => setIsSubmitted(false)}>
              Send another message
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* What to include */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5" />
              <span>Before you write</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Reporting a word error?</span> Include the word's page
              link (or the Arabic word) and what you think is wrong. A Quranic Arabic Corpus or tafsir reference
              helps us check it quickly.
            </p>
            <p>
              <span className="font-medium text-foreground">Account or data requests</span> (such as deleting your
              account): send them from the email address you signed in with.
            </p>
            <p>We aim to reply within a few days.</p>
          </CardContent>
        </Card>
      </div>

      {/* Contact Form */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Send us a message</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    autoComplete="name"
                    maxLength={200}
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email address *</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    maxLength={320}
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="So we can reply to you"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Topic</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Choose a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  type="text"
                  maxLength={300}
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="A short summary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  maxLength={5000}
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="How can we help?"
                  rows={6}
                  required
                />
              </div>

              {/* Honeypot field, hidden from people and assistive tech */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label htmlFor="website">Leave this field empty</label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                />
              </div>

              {submitError && (
                <p role="alert" className="text-sm text-destructive">{submitError}</p>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send message
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                We use your name and email only to reply to this message. See our{' '}
                <a href="/privacy-policy" className="underline hover:text-primary">privacy policy</a>.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContactForm;
