
import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Volume2, 
  Moon, 
  Download, 
  Languages, 
  BookText 
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';
import { resetProgress } from '@/utils/spaced-repetition';
import { useTheme } from '@/components/ThemeProvider';

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [dailyTarget, setDailyTarget] = useState(10);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(theme === 'dark');
  const [transliteration, setTransliteration] = useState('standard');
  const [translation, setTranslation] = useState('sahih');
  
  // Update theme when darkMode state changes
  useEffect(() => {
    setTheme(darkMode ? 'dark' : 'light');
  }, [darkMode, setTheme]);

  // Initialize darkMode state from theme context
  useEffect(() => {
    setDarkMode(theme === 'dark');
  }, [theme]);
  
  const handleReset = () => {
    // In a real app, this would show a confirmation dialog
    resetProgress();
    toast.success('Progress reset successfully', {
      description: 'All your learning data has been reset',
    });
  };

  const handleThemeChange = (checked: boolean) => {
    setDarkMode(checked);
    toast.success(`${checked ? 'Dark' : 'Light'} mode enabled`, {
      description: `The application theme has been updated to ${checked ? 'dark' : 'light'} mode.`,
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>
      
      <div className="glass-card rounded-xl overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-medium">Learning Preferences</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-primary/10 p-2 rounded-lg mr-3">
                <BookText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Daily Word Target</h3>
                <p className="text-sm text-muted-foreground">New words to learn each day</p>
              </div>
            </div>
            <div className="w-1/3">
              <Slider
                value={[dailyTarget]}
                min={5}
                max={20}
                step={5}
                onValueChange={(value) => setDailyTarget(value[0])}
              />
              <div className="text-center text-sm mt-1">{dailyTarget} words</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-secondary/30 p-2 rounded-lg mr-3">
                <Bell className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="font-medium">Daily Reminders</h3>
                <p className="text-sm text-muted-foreground">Notifications for daily practice</p>
              </div>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-accent/10 p-2 rounded-lg mr-3">
                <Volume2 className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-medium">Audio Pronunciation</h3>
                <p className="text-sm text-muted-foreground">Play audio for words and verses</p>
              </div>
            </div>
            <Switch
              checked={audioEnabled}
              onCheckedChange={setAudioEnabled}
            />
          </div>
        </div>
      </div>
      
      <div className="glass-card rounded-xl overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-medium">Display Settings</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-primary/10 p-2 rounded-lg mr-3">
                <Moon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Dark Mode</h3>
                <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
              </div>
            </div>
            <Switch
              checked={darkMode}
              onCheckedChange={handleThemeChange}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-secondary/30 p-2 rounded-lg mr-3">
                <Languages className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="font-medium">Transliteration Style</h3>
                <p className="text-sm text-muted-foreground">How Arabic words are written in Latin script</p>
              </div>
            </div>
            <Select value={transliteration} onValueChange={setTransliteration}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="simplified">Simplified</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-accent/10 p-2 rounded-lg mr-3">
                <BookText className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-medium">Quran Translation</h3>
                <p className="text-sm text-muted-foreground">Select your preferred translation</p>
              </div>
            </div>
            <Select value={translation} onValueChange={setTranslation}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sahih">Sahih International</SelectItem>
                <SelectItem value="pickthall">Pickthall</SelectItem>
                <SelectItem value="yusufali">Yusuf Ali</SelectItem>
                <SelectItem value="khan">Muhammad Muhsin Khan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-medium">Data Management</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-primary/10 p-2 rounded-lg mr-3">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Offline Mode</h3>
                <p className="text-sm text-muted-foreground">Download content for offline study</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              Download
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-destructive">Reset Progress</h3>
              <p className="text-sm text-muted-foreground">Clear all learning data and start fresh</p>
            </div>
            <button 
              onClick={handleReset}
              className="px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
