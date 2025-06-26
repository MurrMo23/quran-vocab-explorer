
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Target, 
  Trophy, 
  Users, 
  Volume2, 
  Brain,
  Play,
  ArrowRight,
  Star,
  CheckCircle,
  Globe
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useIsMobile } from '@/hooks/use-mobile';
import AdPlaceholder from '@/components/ads/AdPlaceholder';
import { Helmet } from 'react-helmet';

const Index = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const isMobile = useIsMobile();

  const features = [
    {
      icon: BookOpen,
      title: 'Comprehensive Collections',
      description: 'Explore organized vocabulary from different Quranic themes and contexts',
      color: 'text-blue-600'
    },
    {
      icon: Volume2,
      title: 'Audio Pronunciation',
      description: 'Listen to native Arabic pronunciation with advanced TTS technology',
      color: 'text-green-600'
    },
    {
      icon: Brain,
      title: 'Adaptive Learning',
      description: 'Personalized learning paths that adapt to your progress and pace',
      color: 'text-purple-600'
    },
    {
      icon: Target,
      title: 'Interactive Practice',
      description: 'Engage with flashcards, quizzes, and pronunciation exercises',
      color: 'text-orange-600'
    },
    {
      icon: Users,
      title: 'Community Learning',
      description: 'Join study groups, compete in challenges, and learn together',
      color: 'text-pink-600'
    },
    {
      icon: Trophy,
      title: 'Progress Tracking',
      description: 'Monitor your learning journey with detailed analytics and achievements',
      color: 'text-yellow-600'
    }
  ];

  const stats = [
    { label: 'Vocabulary Words', value: '2,500+', icon: BookOpen },
    { label: 'Learning Collections', value: '25+', icon: Target },
    { label: 'Active Learners', value: '10,000+', icon: Users },
    { label: 'Languages Supported', value: '5', icon: Globe }
  ];

  return (
    <>
      <Helmet>
        <title>Quran Vocab Explorer | Learn Quranic Arabic Vocabulary</title>
        <meta name="description" content="Master Quranic Arabic vocabulary with interactive learning tools, audio pronunciation, and cultural context. Start your journey today!" />
        <meta name="keywords" content="Quranic Arabic, vocabulary, learning, Islamic education, Arabic language, Quran study" />
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto space-y-8">
              <Badge variant="secondary" className="mb-4">
                ✨ New: Advanced Grammar Modules & Cultural Context
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Master Quranic Arabic Vocabulary
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Discover the beauty of Quranic Arabic through interactive learning, cultural context, and advanced pronunciation tools. 
                Your journey to understanding the Quran starts here.
              </p>
              
              {/* Top Hero Ad */}
              {isMobile ? (
                <AdPlaceholder 
                  adId="hero-mobile" 
                  size="mobile-banner"
                  className="mx-auto mb-8"
                  location="homepage-hero-mobile"
                />
              ) : (
                <AdPlaceholder 
                  adId="hero-desktop" 
                  size="leaderboard"
                  className="mx-auto mb-8"
                  location="homepage-hero"
                />
              )}
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={() => navigate(session ? '/dashboard' : '/auth')}
                  className="text-lg px-8 py-3"
                >
                  <Play className="mr-2 h-5 w-5" />
                  {session ? 'Continue Learning' : 'Start Learning'}
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('/collections')}
                  className="text-lg px-8 py-3"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Browse Collections
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need to Learn
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Comprehensive tools and features designed to make learning Quranic Arabic engaging and effective
              </p>
            </div>
            
            {/* Features Ad */}
            <AdPlaceholder 
              adId="features-section" 
              size="medium-rectangle"
              className="mx-auto mb-12"
              location="homepage-features"
            />
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4`}>
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Learning Path Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold">
                Your Personalized Learning Journey
              </h2>
              <p className="text-xl opacity-90">
                From beginner to advanced, our adaptive learning system guides you through every step
              </p>
              
              <div className="grid md:grid-cols-3 gap-8 mt-12">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold">1</span>
                  </div>
                  <h3 className="text-xl font-semibold">Start with Basics</h3>
                  <p className="opacity-90">Begin with fundamental vocabulary and pronunciation</p>
                </div>
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold">2</span>
                  </div>
                  <h3 className="text-xl font-semibold">Practice & Progress</h3>
                  <p className="opacity-90">Engage with interactive exercises and track your growth</p>
                </div>
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold">3</span>
                  </div>
                  <h3 className="text-xl font-semibold">Master Advanced Concepts</h3>
                  <p className="opacity-90">Explore complex vocabulary and cultural nuances</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Loved by Learners Worldwide
              </h2>
              <p className="text-xl text-muted-foreground">
                Join thousands of students on their Quranic Arabic journey
              </p>
            </div>
            
            {/* Testimonials Ad */}
            <AdPlaceholder 
              adId="testimonials-section" 
              size="large-rectangle"
              className="mx-auto mb-12"
              location="homepage-testimonials"
            />
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah Ahmed",
                  role: "Student",
                  content: "This platform transformed my understanding of Quranic Arabic. The cultural context feature is incredible!",
                  rating: 5
                },
                {
                  name: "Mohammed Hassan",
                  role: "Teacher",
                  content: "I recommend this to all my students. The pronunciation tools and grammar modules are excellent.",
                  rating: 5
                },
                {
                  name: "Fatima Ali",
                  role: "Scholar",
                  content: "The etymology and historical context make learning so much more meaningful and memorable.",
                  rating: 5
                }
              ].map((testimonial, index) => (
                <Card key={index} className="bg-gray-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Begin Your Journey?
              </h2>
              <p className="text-xl opacity-90">
                Join thousands of learners exploring the beautiful language of the Quran
              </p>
              
              {/* Bottom CTA Ad */}
              <AdPlaceholder 
                adId="cta-section" 
                size="medium-rectangle"
                className="mx-auto mb-8"
                location="homepage-cta"
              />
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={() => navigate(session ? '/dashboard' : '/auth')}
                  className="text-lg px-8 py-3"
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  {session ? 'Continue Learning' : 'Get Started Free'}
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('/collections')}
                  className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-purple-600"
                >
                  Explore Content
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Ad */}
        <section className="py-8 bg-white">
          <div className="container mx-auto px-4">
            <AdPlaceholder 
              adId="footer-section" 
              size="leaderboard"
              className="mx-auto"
              location="homepage-footer"
            />
          </div>
        </section>
      </div>
    </>
  );
};

export default Index;
