import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchWords, Word } from '@/utils/vocabulary';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: (query: string) => void;
  value?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  className,
  placeholder = "Search words...",
  onChange,
  onSearch,
  value 
}) => {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState<Word[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.trim().length >= 2) {
      const foundWords = searchWords(query);
      setResults(foundWords);
      setIsOpen(true);
      
      // Call onSearch prop if provided
      if (onSearch) {
        onSearch(query);
      }
    } else {
      setResults([]);
      setIsOpen(false);
      
      // Call onSearch with empty string when query is cleared
      if (onSearch && query.trim() === '') {
        onSearch('');
      }
    }
  }, [query, onSearch]);

  useEffect(() => {
    // If the component is being controlled externally
    if (value !== undefined && value !== query) {
      setQuery(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    if (onChange) {
      const event = { target: { value: '' } } as React.ChangeEvent<HTMLInputElement>;
      onChange(event);
    }
    if (onSearch) {
      onSearch('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (onChange) {
      onChange(e);
    }
  };

  const handleSelect = (wordId: string) => {
    navigate(`/word/${wordId}`);
    setIsOpen(false);
    setQuery('');
    if (onChange) {
      const event = { target: { value: '' } } as React.ChangeEvent<HTMLInputElement>;
      onChange(event);
    }
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full bg-white/70 border border-gray-200 rounded-full pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {query && (
          <button 
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-10 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-100 max-h-80 overflow-y-auto">
          {results.map((word) => (
            <button
              key={word.id}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-none flex items-start"
              onClick={() => handleSelect(word.id)}
            >
              <div>
                <div className="flex items-center">
                  <span className="text-lg font-arabic">{word.arabic}</span>
                  <span className="text-sm text-muted-foreground ml-2">({word.transliteration})</span>
                </div>
                <div className="text-sm text-foreground">{word.meaning}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && (
        <div className="absolute z-10 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-100 p-4 text-center">
          <p className="text-muted-foreground">No results found for "{query}"</p>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
