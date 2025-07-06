import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
}

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate form submission - in real app, this would call an API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSubmitted(true);
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          subject: '',
          category: '',
          message: ''
        });
        setIsSubmitted(false);
      }, 3000);
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
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
            <h3 className="text-xl font-semibold">Message Sent Successfully!</h3>
            <p className="text-muted-foreground max-w-md">
              Thank you for contacting us. We've received your message and will get back to you within 24 hours.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Contact Information */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Email Support</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-medium">General Inquiries</p>
              <p className="text-sm text-muted-foreground">info@arabicvocabulary.com</p>
            </div>
            <div>
              <p className="font-medium">Technical Support</p>
              <p className="text-sm text-muted-foreground">support@arabicvocabulary.com</p>
            </div>
            <div>
              <p className="font-medium">Content Questions</p>
              <p className="text-sm text-muted-foreground">content@arabicvocabulary.com</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <span>Response Times</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Technical Issues:</span>
              <span className="text-sm font-medium">24 hours</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">General Inquiries:</span>
              <span className="text-sm font-medium">1-2 days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Content Questions:</span>
              <span className="text-sm font-medium">2-3 days</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Form */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Send us a Message</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical Support</SelectItem>
                    <SelectItem value="general">General Inquiry</SelectItem>
                    <SelectItem value="content">Content Question</SelectItem>
                    <SelectItem value="billing">Billing & Subscription</SelectItem>
                    <SelectItem value="feedback">Feedback & Suggestions</SelectItem>
                    <SelectItem value="partnership">Partnership Inquiry</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="Brief description of your inquiry"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Please provide detailed information about your inquiry..."
                  rows={6}
                  required
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full md:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Sending Message...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContactForm;