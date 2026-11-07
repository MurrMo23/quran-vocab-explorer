import React from 'react';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Heart } from 'lucide-react';

const learnLinks = [
  { to: '/collections', label: 'Vocabulary Collections' },
  { to: '/surahs', label: 'Surah vocabulary' },
  { to: '/roots', label: 'Roots' },
  { to: '/review', label: 'Daily Review' },
  { to: '/ramadan', label: 'Ramadan 30-day plan' },
  { to: '/blog', label: 'Blog' },
];

const siteLinks = [
  { to: '/about', label: 'About QuranVocab' },
  { to: '/help', label: 'Help' },
  { to: '/contact', label: 'Contact & Report an Error' },
];

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand & Description */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center" aria-label="QuranVocab home">
              <img
                src="/lovable-uploads/b5c20cf5-bb83-4ad5-ac3d-308060e995d8.png"
                alt="QuranVocab"
                className="h-12 brightness-0 invert"
              />
            </Link>
            <p className="text-sm">
              Learn the words of the Quran. QuranVocab is a free, independent tool for learning high-frequency
              Quranic Arabic vocabulary with themed collections and a daily spaced-repetition review.
            </p>
            <p className="text-xs text-gray-400">
              Word data is being checked against the Quranic Arabic Corpus and Tanzil Quran text.{' '}
              <Link to="/about" className="underline hover:text-primary">Sources</Link>
            </p>
          </div>

          {/* Learn */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Learn</h3>
            <ul className="space-y-2 text-sm">
              {learnLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-primary transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Site */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">QuranVocab</h3>
            <ul className="space-y-2 text-sm">
              {siteLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-primary transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-gray-700" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
            <p className="text-sm">
              © {currentYear} QuranVocab
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <Link to="/privacy-policy" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link to="/contact" className="hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-sm">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500" aria-label="love" />
            <span>for learners of the Quran</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
