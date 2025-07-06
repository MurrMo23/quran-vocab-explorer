import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  HelpCircle, 
  Users, 
  Mail, 
  Shield, 
  FileText,
  ArrowRight
} from 'lucide-react';

const contentPages = [
  { slug: 'help', title: 'Help & Support', icon: HelpCircle, description: 'Get help and find answers' },
  { slug: 'about', title: 'About Us', icon: Users, description: 'Learn about our mission' },
  { slug: 'contact', title: 'Contact Us', icon: Mail, description: 'Get in touch with us' },
  { slug: 'privacy-policy', title: 'Privacy Policy', icon: Shield, description: 'How we protect your data' },
  { slug: 'terms-of-service', title: 'Terms of Service', icon: FileText, description: 'Terms and conditions' },
];

interface ContentPageNavigationProps {
  currentSlug?: string;
  showAsGrid?: boolean;
}

const ContentPageNavigation: React.FC<ContentPageNavigationProps> = ({ 
  currentSlug, 
  showAsGrid = false 
}) => {
  const location = useLocation();
  const currentPath = location.pathname.replace('/', '');

  if (showAsGrid) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contentPages.map((page) => {
          const Icon = page.icon;
          const isActive = currentPath === page.slug;
          
          return (
            <Card key={page.slug} className={`transition-all duration-200 hover:shadow-lg ${isActive ? 'ring-2 ring-primary' : ''}`}>
              <CardContent className="p-6">
                <Link 
                  to={`/${page.slug}`}
                  className="flex flex-col items-center text-center space-y-4 text-decoration-none"
                >
                  <div className="p-3 rounded-full bg-primary/10">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{page.title}</h3>
                    <p className="text-sm text-muted-foreground">{page.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <Card className="sticky top-4">
      <CardContent className="p-4">
        <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">
          Quick Navigation
        </h3>
        <nav className="space-y-2">
          {contentPages.map((page) => {
            const Icon = page.icon;
            const isActive = currentPath === page.slug;
            
            return (
              <Button
                key={page.slug}
                asChild
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start text-left h-auto p-3"
              >
                <Link to={`/${page.slug}`} className="flex items-center space-x-3">
                  <Icon className="h-4 w-4" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{page.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{page.description}</div>
                  </div>
                </Link>
              </Button>
            );
          })}
        </nav>
      </CardContent>
    </Card>
  );
};

export default ContentPageNavigation;