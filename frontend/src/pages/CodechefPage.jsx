import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CodeChefStats from '../components/CodechefStats';
import Header from '../components/Header';
import { useUserProfile } from '../context/UserProfileContext';
import { UserAuth } from '../context/AuthContext';
import SixMonthActivityCard from '../components/SixMonthActivityCard';

const normalizeDateKey = (raw) => {
  if (!raw) return null;
  if (typeof raw === 'number') {
    const tsMs = raw < 1e12 ? raw * 1000 : raw;
    const d = new Date(tsMs);
    if (Number.isNaN(d.getTime())) return null;
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (/^\d{8}$/.test(trimmed)) {
      const year = trimmed.slice(0, 4);
      const month = trimmed.slice(4, 6);
      const day = trimmed.slice(6, 8);
      return `${year}-${month}-${day}`;
    }
    if (/^\d+$/.test(trimmed)) {
      const numericTs = Number(trimmed);
      if (Number.isFinite(numericTs)) {
        const tsMs = trimmed.length <= 10 ? numericTs * 1000 : numericTs;
        const d = new Date(tsMs);
        if (!Number.isNaN(d.getTime())) {
          return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
        }
      }
    }
    const normalized = raw.replace(/\//g, '-');
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(normalized)) {
      const [year, month, day] = normalized.split('-');
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
};

const CodechefPage = () => {
  const { profileData, loading: profileLoading, error: profileError } = useUserProfile();
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const API_BASE = import.meta.env.VITE_BACKEND_URL ?? '';
  const { session } = UserAuth();
  const codechefCalendar = useMemo(() => {
    const mapped = {};
    const heatmap = statsData?.submissionHeatmap?.heatmapData || [];
    heatmap.forEach((entry) => {
      if (!entry?.date) return;
      const key = normalizeDateKey(entry.date);
      if (!key) return;
      mapped[key] = (mapped[key] || 0) + (Number(entry.count) || 0);
    });
    return mapped;
  }, [statsData?.submissionHeatmap?.heatmapData]);

  useEffect(() => {
    if (profileData?.codechef_username) {
      setUsername(profileData.codechef_username);
    }
  }, [profileData]);

  const upsertCodeChefData = useCallback(async (data) => {
    try {
      if (!session) return;

      // Prepare contest ranking data
      const contestRankingData = {
        codechef_stars: data.profileInfo?.stars || 0,
        codechef_recent_contest_rating: data.profileInfo?.rating || 0,
        codechef_max_contest_rating: data.profileInfo?.highestRating || 0,
      };

      // Prepare total questions data
      const totalQuestionsData = {
        codechef_total: data.profileInfo?.problemsSolved || 0,
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
      console.error('Error upserting CodeChef data:', err);
    }
  }, [API_BASE, session]);

  const upsertCodeforcesDatas = useCallback(async () => {
    try {
      if (!session) return;

      // Prepare contest ranking data with null values
      const contestRankingData = {
        codechef_recent_contest_rating: null,
        codechef_max_contest_rating: null,
        codechef_stars :null
      };

      // Prepare total questions data with null values
      const totalQuestionsData = {
        codechef_total: null,
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
      console.error('Error upserting Codechef data:', err);
    }
  }, [API_BASE, session]);

  useEffect(() => {
    if (!username) {
      if (session) {
        upsertCodeforcesDatas();
      }
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/codechef/profile/${username}/?t=${Date.now()}`);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error(data?.error || 'User not found on CodeChef');
          } else if (res.status >= 500) {
            throw new Error(data?.error || 'CodeChef is temporarily unavailable. Please try again in a few minutes.');
          } else {
            throw new Error(data?.error || `Failed to fetch CodeChef stats (${res.status})`);
          }
        }
        
        if (!data || Object.keys(data).length === 0) {
          throw new Error('No data found for this user');
        }

        // Fallback for cases where merged analysis has no heatmap payload.
        if (!Array.isArray(data?.submissionHeatmap?.heatmapData) || data.submissionHeatmap.heatmapData.length === 0) {
          const heatmapRes = await fetch(`${API_BASE}/api/codechef/profile/${username}/heatmap?t=${Date.now()}`);
          const heatmapData = await heatmapRes.json().catch(() => ({}));
          if (heatmapRes.ok && Array.isArray(heatmapData?.heatmapData)) {
            data.submissionHeatmap = {
              activeDays: heatmapData.activeDays || 0,
              totalSubmissions: heatmapData.totalSubmissions || 0,
              heatmapData: heatmapData.heatmapData || [],
            };
          }
        }
        
        setStatsData(data);
        setError(null);
        
        // Update database tables
        if (session) {
          await upsertCodeChefData(data);
        }
      } catch (err) {
        setError(err.message);
        setStatsData(null);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchStats, 300);
    return () => clearTimeout(timer);
  }, [API_BASE, username, session, upsertCodeChefData, upsertCodeforcesDatas]);

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        <p>Error loading profile: {profileError}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app text-[var(--text-primary)]">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <motion.div
          className="mx-auto max-w-4xl rounded-2xl border border-[var(--border-muted)] bg-[var(--surface)] p-6 shadow-lg backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="mb-4 text-2xl font-bold text-[var(--brand-color)]">CodeChef Stats</h2>
          
          {!username ? (
            <div className="text-center p-8">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--surface-muted)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-3">No CodeChef Username Found</h2>
              <p className="mb-6 text-[var(--text-muted)]">Please add your CodeChef username to your profile.</p>
              <a
                href="/profile"
                className="inline-block rounded-lg bg-[var(--brand-color)] px-6 py-2 text-white transition-opacity hover:opacity-90"
              >
                Go to Profile
              </a>
            </div>
          ) : loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-[var(--text-muted)]">Loading CodeChef stats...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center p-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/15">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">We encountered an issue</h3>
              <p className="mb-6 text-[var(--text-muted)]">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="rounded-lg bg-[var(--brand-color)] px-6 py-2 text-white transition-opacity hover:opacity-90"
              >
                Try Again
              </button>
            </div>
          ) : (
            <CodeChefStats data={statsData} />
          )}
        </motion.div>

        {username && !loading && !error ? (
          <div className="mx-auto mt-6 max-w-4xl">
            <SixMonthActivityCard submissionCalendar={codechefCalendar} title="CodeChef 6-Month Activity" />
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default CodechefPage;
