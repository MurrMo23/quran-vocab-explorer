
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getUserProgress } from '@/utils/spaced-repetition';
import { Calendar as CalendarIcon, LineChart, Bookmark } from 'lucide-react';

// Simulated data - in a real app this would come from the user's activity history
const generateActivityData = () => {
  const today = new Date();
  const data = [];
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      wordsLearned: Math.floor(Math.random() * 10),
      wordsReviewed: Math.floor(Math.random() * 15) + 5,
    });
  }
  
  return data;
};

const ProgressReport = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const activityData = generateActivityData();
  const progress = getUserProgress();
  
  const last7Days = activityData.slice(-7);
  
  return (
    <div className="glass-card rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-6">Progress Report</h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
            <span>Daily Activity</span>
          </h3>
          <div className="bg-white/50 rounded-lg p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md"
            />
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <LineChart className="h-5 w-5 mr-2 text-primary" />
            <span>Weekly Progress</span>
          </h3>
          <div className="bg-white/50 rounded-lg p-4 h-[calc(100%-2rem)]">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={last7Days}>
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { weekday: 'short' })}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="wordsLearned" name="New Words" fill="#4f46e5" />
                <Bar dataKey="wordsReviewed" name="Reviewed" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <Bookmark className="h-5 w-5 mr-2 text-primary" />
          <span>Learning Summary</span>
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-primary">{progress.totalWords}</div>
            <div className="text-sm text-muted-foreground">Total Words</div>
          </div>
          
          <div className="bg-white/50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-500">{progress.masteredWords}</div>
            <div className="text-sm text-muted-foreground">Mastered</div>
          </div>
          
          <div className="bg-white/50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-amber-500">{progress.streak}</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </div>
          
          <div className="bg-white/50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-500">{progress.mastery}%</div>
            <div className="text-sm text-muted-foreground">Overall Mastery</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressReport;
