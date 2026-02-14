import { useState, useEffect } from 'react';
import axios from 'axios';
import { CodeIcon, ActivityIcon } from 'lucide-react';
import EnhancedCalendarHeatmap from './EnhancedCalendarHeatmap';

const CombinedHeatmap = ({ profileData }) => {
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const API_BASE = import.meta.env.VITE_BACKEND_URL ?? '';

  useEffect(() => {
    if (
      !profileData ||
      (!profileData.leetcode_username &&
        !profileData.codeforces_username &&
        !profileData.codechef_username)
    ) return;

    const fetchHeatmap = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${API_BASE}/api/dash/heatmap`, {
          params: {
            leetcode: profileData.leetcode_username || '',
            codeforces: profileData.codeforces_username || '',
            codechef: profileData.codechef_username || ''
          }
        });

        setHeatmap(response.data);
      } catch (err) {
        setError('Failed to load coding activity');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmap();
  }, [API_BASE, profileData]);

  const getCount = (day) => {
    if (selectedPlatform === 'all') {
      return day.count || 0;
    } else {
      return day.platforms?.[selectedPlatform] || 0;
    }
  };

  const totalSubmissions = heatmap.reduce((sum, day) => sum + getCount(day), 0);
  const activeDays = heatmap.filter(day => getCount(day) > 0).length;

  const getMaxStreak = () => {
    let maxStreak = 0, currentStreak = 0;
    const sorted = [...heatmap].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    for (let i = 0; i < sorted.length; i++) {
      const currentDate = new Date(sorted[i].date);
      const currentCount = getCount(sorted[i]);

      if (currentCount > 0) {
        if (i === 0) {
          currentStreak = 1;
        } else {
          const prevDate = new Date(sorted[i - 1].date);
          const timeDiff = currentDate - prevDate;
          const diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));
          
          if (diffDays === 1) {
            currentStreak++;
          } else if (diffDays !== 0) {
            currentStreak = 1;
          }
        }
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    return maxStreak;
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-[var(--border-muted)] bg-[var(--surface)] p-6 text-[var(--text-primary)] shadow-sm">
        <ActivityIcon className="w-12 h-12 text-gray-400 animate-pulse mb-4" />
        <p className="font-medium text-[var(--text-muted)]">Loading coding activity...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-[var(--border-muted)] bg-[var(--surface)] p-6 text-center shadow-sm">
        <CodeIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 font-semibold">{error}</p>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Check your connections or usernames</p>
      </div>
    );
  }

  return (
    <div className="mt-2 rounded-2xl border border-[var(--border-muted)] bg-[var(--surface)] p-6 text-[var(--text-primary)] shadow-lg backdrop-blur-sm">
      <div className="flex justify-between items-center mb-2 ">
        <div className="text-sm">
          <span className="text-xl font-semibold">{totalSubmissions}</span> submissions in the past year
        </div>
        <div className="space-x-4 text-xs text-[var(--text-muted)]">
          <span>Active days: {activeDays}</span>
          <span>Max streak: {getMaxStreak()}</span>
        </div>
      </div>

      <EnhancedCalendarHeatmap
        startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
        endDate={new Date()}
        values={heatmap}
        selectedPlatform={selectedPlatform}
        onPlatformChange={setSelectedPlatform}
        gutterSize={4}
        showWeekdayLabels={true}
      />
    </div>
  );
};

export default CombinedHeatmap;
