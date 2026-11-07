
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Target, 
  Trophy, 
  Volume2, 
  Brain,
  Play,
  ArrowRight,
  CheckCircle,
  Layers,
  Unlock,
  Database
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import SEO from '@/components/SEO';
import { ogImage } from '@/utils/og-image';
import { sampleVocabulary, collections, getWordsByCollection } from '@/utils/vocabulary';
import GoalChooser from '@/components/onboarding/GoalChooser';
import RamadanPromo from '@/components/RamadanPromo';

// Computed once from the bundled data so the numbers on the page are always true.
const wordCount = sampleVocabulary.length;
const collectionCount = collections.filter((c) => getWordsByCollection(c.id).length > 0).length;

const Index = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  const features = [
    {
      icon: BookOpen,
      title: 'Themed Collections',
      description: 'Browse Quranic vocabulary grouped by theme: faith, prophets, worship, the afterlife, nature and more',
      color: 'text-blue-600'
    },
    {
      icon: Volume2,
      title: 'Audio Pronunciation',
      description: 'Listen to each word pronounced in Arabic as you study it',
      color: 'text-green-600'
    },
    {
      icon: Brain,
      title: 'Roots & Meanings',
      description: 'See the three-letter root behind each word so related words become easier to recognise',
      color: 'text-purple-600'
    },
    {
      icon: Target,
      title: 'One Daily Review',
      description: 'Hear each word, recall its meaning, and answer quick multiple-choice checks in one short session',
      color: 'text-orange-600'
    },
    {
      icon: Layers,
      title: 'Word Pages',
      description: 'Every word has its own page with Arabic spelling, transliteration, root and meaning',
      color: 'text-pink-600'
    },
    {
      icon: Trophy,
      title: 'Full Collections, Free',
      description: 'Use every collection without an account; create a free account to keep your progress across devices',
      color: 'text-yellow-600'
    }
  ];

  const stats = [
    { label: 'Quranic words', value: wordCount.toLocaleString('en-US'), icon: BookOpen },
    { label: 'Themed collections', value: collectionCount.toLocaleString('en-US'), icon: Target },
    { label: 'No subscriptions, no ads', value: 'Free', icon: Unlock },
    { label: 'Browse and try without signing up', value: 'Open', icon: CheckCircle }
  ];

  return (
    <>
      <SEO 
        title="QuranVocab — Learn the Words of the Quran"
        description={`Learn ${wordCount} common words of the Quran with flashcards, quizzes and word pages showing root and meaning. Free, no account needed to start.`}
        keywords={["Quranic Arabic", "Quran vocabulary", "Quranic words", "Arabic flashcards", "Quran study"]}
        image={ogImage('pages', 'home')}
        type="website"
      />

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto space-y-8">
              <Badge variant="secondary" className="mb-4">
                Free · {wordCount} words · {collectionCount} collections
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Learn the Words of the Quran
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                QuranVocab helps you learn high-frequency Quranic Arabic vocabulary with themed collections,
                flashcards and quizzes. Use it all without an account; sign in for free to keep your progress across devices.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={() => navigate(session ? '/dashboard' : '/review')}
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

        {/* First-visit goal chooser and the Ramadan plan */}
        <section className="container mx-auto max-w-4xl space-y-4 px-4 py-8">
          <GoalChooser />
          <RamadanPromo />
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
                Simple tools focused on one goal: recognising the words you hear and read in the Quran
              </p>
            </div>
            
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
                How It Works
              </h2>
              <p className="text-xl opacity-90">
                Start with the most common words, practise a little every day, and build from there
              </p>
              
              <div className="grid md:grid-cols-3 gap-8 mt-12">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold">1</span>
                  </div>
                  <h3 className="text-xl font-semibold">Pick a Collection</h3>
                  <p className="opacity-90">Begin with a themed set of frequent Quranic words</p>
                </div>
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold">2</span>
                  </div>
                  <h3 className="text-xl font-semibold">Practise with Flashcards</h3>
                  <p className="opacity-90">Recall each meaning, reveal the answer and mark what you knew</p>
                </div>
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold">3</span>
                  </div>
                  <h3 className="text-xl font-semibold">Come Back Daily</h3>
                  <p className="opacity-90">Each word returns just before you would forget it, with quick checks mixed in</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sources Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                An Independent, Open Project
              </h2>
              <p className="text-lg text-muted-foreground">
                QuranVocab is a free, independent project. Word data is being checked against the Quranic Arabic
                Corpus and the Tanzil Quran text. If you spot a mistake, please let us know through the contact page
                so we can correct it.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" onClick={() => navigate('/about')}>
                  About QuranVocab &amp; sources
                </Button>
                <Button variant="ghost" onClick={() => navigate('/contact')}>
                  Report an error
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Begin?
              </h2>
              <p className="text-xl opacity-90">
                Open a collection and start learning your first Quranic words today
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={() => navigate(session ? '/dashboard' : '/review')}
                  className="text-lg px-8 py-3"
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  {session ? 'Continue Learning' : 'Start Practising Free'}
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
      </div>
    </>
  );
};

export default Index;
