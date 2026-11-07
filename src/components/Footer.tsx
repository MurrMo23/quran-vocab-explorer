import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './brand/Logo';

const learnLinks = [
  { to: '/review', label: 'Daily review' },
  { to: '/collections', label: 'Collections' },
  { to: '/surahs', label: 'Surah word lists' },
  { to: '/roots', label: 'Roots' },
  { to: '/custom-learning', label: 'My collections' },
];

const exploreLinks = [
  { to: '/names-of-allah', label: '99 Names of Allah' },
  { to: '/ramadan', label: 'Ramadan 30-day plan' },
  { to: '/audio-practice', label: 'Audio practice' },
  { to: '/blog', label: 'Blog' },
];

const aboutLinks = [
  { to: '/about', label: 'About & sources' },
  { to: '/help', label: 'Help' },
  { to: '/contact', label: 'Contact & report an error' },
  { to: '/privacy-policy', label: 'Privacy' },
  { to: '/terms-of-service', label: 'Terms' },
];

const Column = ({ title, links }: { title: string; links: { to: string; label: string }[] }) => (
  <div className="space-y-3">
    <h2 className="text-sm font-extrabold text-[#EEF3F0]">{title}</h2>
    <ul className="space-y-2 text-sm">
      {links.map((l) => (
        <li key={l.to}>
          <Link to={l.to} className="text-[#A3B5AE] transition-colors hover:text-[#3CC4A6]">
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

// Always dark (ink green), in both themes, so the logo uses its light-on-dark colours here.
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="dark mt-16 bg-[#10231F] text-[#A3B5AE]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <Link to="/" aria-label="QuranVocab home" className="inline-block">
            <Logo className="h-9" />
          </Link>
          <p className="max-w-sm text-sm leading-relaxed">
            Free, ad-free Quranic vocabulary. Word data is checked against the Quranic Arabic Corpus and the Tanzil
            Quran text. English translation: Saheeh International.
          </p>
        </div>
        <Column title="Learn" links={learnLinks} />
        <Column title="Explore" links={exploreLinks} />
        <Column title="QuranVocab" links={aboutLinks} />
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs sm:px-6">© {currentYear} QuranVocab · Made for learners of the Quran</p>
      </div>
    </footer>
  );
};

export default Footer;
