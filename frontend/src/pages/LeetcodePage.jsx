import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import LeetCodeStats from '../components/LeetCodeStats';
import Header from '../components/Header';
import { useUserProfile } from '../context/UserProfileContext';
import { useNavigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import SixMonthActivityCard from '../components/SixMonthActivityCard';

const toDateKeyedCalendar = (calendar = {}) => {
  const mapped = {};
  Object.entries(calendar).forEach(([key, value]) => {
    const count = Number(value) || 0;
    if (key.includes('-')) {
      mapped[key] = (mapped[key] || 0) + count;
      return;
    }

    const timestamp = Number(key);
    if (!Number.isFinite(timestamp)) return;
    const date = new Date(timestamp * 1000);
    const dateKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
    mapped[dateKey] = (mapped[dateKey] || 0) + count;
  });
  return mapped;
};

const NoUserNameFound = ({ service = "LeetCode", redirectPath = "/profile" }) => {
  const navigate = useNavigate();
  
  const handleGoToProfile = () => {
    navigate(redirectPath);
  };
  
  return (
    <div className="flex flex-col items-center justify-center py-4 px-4 text-center">
      <div className="mb-6 rounded-full border border-[var(--border-muted)] bg-[var(--surface-muted)] p-6">
        <svg 
          className="h-12 w-12 text-[var(--text-muted)]" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
          <path 
            strokeLinecap="round" 
            strokeWidth="2" 
            d="M9 15c.83.67 1.94 1 3 1s2.17-.33 3-1" 
          />
          <circle cx="9" cy="9" r="1.5" />
          <circle cx="15" cy="9" r="1.5" />
        </svg>
      </div>
      
      <h2 className="mb-4 text-xl font-bold text-[var(--text-primary)]">
        No {service} Username Found
      </h2>
      <p className="mb-8 text-[var(--text-muted)]">
        Please add your {service} username to your profile to view your statistics.
      </p>

      <button 
        onClick={handleGoToProfile}
        className="w-64 rounded-lg bg-[var(--brand-color)] px-8 py-3 font-medium text-white transition-opacity hover:opacity-90"
      >
        Go to Profile
      </button>
    </div>
  );
};

const LeetcodePage = () => {
  const { profileData, error: profileError } = useUserProfile();
  const [username, setUsername] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const { session, loading: authLoading } = UserAuth();
  const API_BASE = import.meta.env.VITE_BACKEND_URL ?? '';

  const leetcodeCalendar = useMemo(
    () => toDateKeyedCalendar(statsData?.submissionCalendar || {}),
    [statsData?.submissionCalendar]
  );

  // Function to upsert LeetCode data with null values
  const upsertLeetCodeData = useCallback(async () => {
    try {
      if (!session) return;

      // Prepare contest ranking data with null values
      const contestRankingData = {
        leetcode_recent_contest_rating: null,
        leetcode_max_contest_rating: null,
      };

      // Prepare total questions data with null values
      const totalQuestionsData = {
        leetcode_easy: null,
        leetcode_medium: null,
        leetcode_hard: null,
        leetcode_total: null,
      };

      // Upsert both data sets
      const upsertPromises = [
        fetch(`${API_BASE}/api/dashboard/${session.user.id}/contest-ranking`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify(contestRankingData)
        }),
        fetch(`${API_BASE}/api/dashboard/${session.user.id}/total-questions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify(totalQuestionsData)
        })
      ];

      await Promise.all(upsertPromises);
    } catch (err) {
      console.error('Error upserting LeetCode data:', err);
    }
  }, [API_BASE, session]);

  useEffect(() => {
    if (profileData) {
      if (profileData.leetcode_username) {
        setUsername(profileData.leetcode_username);
      } else if (session) {
        upsertLeetCodeData();
      }
    }
  }, [profileData, session, upsertLeetCodeData]);

  if (profileError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        <p>Error loading profile: {profileError}</p>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app text-[var(--text-primary)]">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <motion.div
          layout
          className="mb-8 mx-auto max-w-4xl rounded-2xl border border-[var(--border-muted)] bg-[var(--surface)] p-6 shadow-lg backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="mb-4 text-2xl font-bold text-[var(--brand-color)]">LeetCode Stats</h2>
          {username ? (
            <LeetCodeStats username={username} onDataLoaded={setStatsData} />
          ) : (
            <NoUserNameFound service="LeetCode" redirectPath="/profile" />
          )}
        </motion.div>

        {username && Object.keys(leetcodeCalendar).length > 0 ? (
          <div className="mx-auto max-w-4xl">
            <SixMonthActivityCard submissionCalendar={leetcodeCalendar} />
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default LeetcodePage;
