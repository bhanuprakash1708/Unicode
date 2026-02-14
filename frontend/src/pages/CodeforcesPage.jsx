import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import ProfileCard from '../components/codeforces/ProfileCard';
import RatingChart from '../components/codeforces/RatingChart';
import RecentContests from '../components/codeforces/RecentContests';
import CalendarHeatmap from '../components/codeforces/CalendarHeatmap';
import Header from '../components/Header';
import { useUserProfile } from '../context/UserProfileContext';
import { UserAuth } from '../context/AuthContext';

const CodeforcesPage = () => {
  const { profileData, loading: profileLoading, error: profileError } = useUserProfile();
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [fetchError, setFetchError] = useState('');
  const API_BASE = import.meta.env.VITE_BACKEND_URL ?? '';
  const { session } = UserAuth();

  // Get username from profile data
  useEffect(() => {
    if (profileData?.codeforces_username) {
      setUsername(profileData.codeforces_username);
    }
  }, [profileData]);

  const upsertCodeforcesData = useCallback(async (data) => {
    try {
      if (!session) return;

      // Prepare contest ranking data (only updating Codeforces fields)
      const contestRankingData = {
        codeforces_recent_contest_rating: data.rating || 0,
        codeforces_max_contest_rating: data.maxRating || 0
      };

      // Prepare total questions data (only updating Codeforces field)
      const totalQuestionsData = {
        codeforces_total: data.totalSolved || 0,
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
      console.error('Error upserting Codeforces data:', err);
    }
  }, [API_BASE, session]);

  const upsertCodeforcesDatas = useCallback(async () => {
    try {
      if (!session) return;

      // Prepare contest ranking data with null values
      const contestRankingData = {
        codeforces_recent_contest_rating: null,
        codeforces_max_contest_rating: null,
      };

      // Prepare total questions data with null values
      const totalQuestionsData = {
        codeforces_total: null,
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
      console.error('Error upserting Codeforces data:', err);
    }
  }, [API_BASE, session]);

  // Fetch Codeforces data when username changes
  useEffect(() => {
    if (!username) {
      if (session) {
        upsertCodeforcesDatas();
      }
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setFetchError('');
        
        const response = await fetch(`${API_BASE}/api/codeforces/profile/${username}?t=${Date.now()}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid data received from API');
        }
        
        setUserData(data);
        
        // Update database tables
        if (session) {
          await upsertCodeforcesData(data);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setFetchError(err.message || 'Failed to load profile data');
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [API_BASE, username, session, upsertCodeforcesData, upsertCodeforcesDatas]);

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
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          layout
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {username ? (
            <>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : fetchError ? (
                <motion.div
                  className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 p-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <h2 className="text-xl font-bold text-red-300 mb-2">Error Loading Codeforces Data</h2>
                  <p className="text-red-300">{fetchError}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 rounded bg-[var(--brand-color)] px-4 py-2 text-white transition-opacity hover:opacity-90"
                  >
                    Retry
                  </button>
                </motion.div>
              ) : userData ? (
                <>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <ProfileCard user={userData} />
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="rounded-xl border border-[var(--border-muted)] bg-[var(--surface)] p-6 shadow-lg backdrop-blur-sm"
                  >
                    <h2 className="mb-4 text-xl font-bold text-[var(--brand-color)]">Performance Overview</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="rounded-lg border border-[var(--border-muted)] bg-[var(--surface-strong)] p-4">
                        <h3 className="text-sm text-[var(--text-muted)]">Current Rating</h3>
                        <p className="text-2xl font-bold text-[var(--text-primary)]">{userData.rating || '-'}</p>
                      </div>
                      <div className="rounded-lg border border-[var(--border-muted)] bg-[var(--surface-strong)] p-4">
                        <h3 className="text-sm text-[var(--text-muted)]">Max Rating</h3>
                        <p className="text-2xl font-bold text-[var(--text-primary)]">{userData.maxRating || '-'}</p>
                      </div>
                      <div className="rounded-lg border border-[var(--border-muted)] bg-[var(--surface-strong)] p-4">
                        <h3 className="text-sm text-[var(--text-muted)]">Contests</h3>
                        <p className="text-2xl font-bold text-[var(--text-primary)]">{userData.contests || 0}</p>
                      </div>
                      <div className="rounded-lg border border-[var(--border-muted)] bg-[var(--surface-strong)] p-4">
                        <h3 className="text-sm text-[var(--text-muted)]">Problems Solved</h3>
                        <p className="text-2xl font-bold text-[var(--text-primary)]">{userData.totalProblemsSolved || 0}</p>
                      </div>
                    </div>
                  </motion.div>

                  {userData.submissionCalendar && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <CalendarHeatmap submissionCalendar={userData.submissionCalendar} />
                    </motion.div>
                  )}

                  {userData.recentContests && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      <RecentContests contests={userData.recentContests} />
                    </motion.div>
                  )}

                  {userData.ratingHistory && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      <RatingChart ratingHistory={userData.ratingHistory} />
                    </motion.div>
                  )}
                </>
              ) : (
                <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 p-6">
                  <h2 className="text-xl font-bold text-red-300 mb-2">No Data Found</h2>
                  <p className="text-red-300">Could not retrieve Codeforces data for this username.</p>
                </div>
              )}
            </>
          ) : (
            <motion.div
              className="rounded-xl border border-[var(--border-muted)] bg-[var(--surface)] p-8 text-center shadow-lg backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--surface-muted)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">No Codeforces Username Found</h2>
              <p className="mb-6 text-[var(--text-muted)]">Please add your Codeforces username to your profile to view statistics.</p>
              <button
                className="mx-auto w-full max-w-xs rounded-lg bg-[var(--brand-color)] px-6 py-2 text-white transition-opacity hover:opacity-90"
                onClick={() => window.location.href = '/profile'}
              >
                Go to Profile
              </button>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default CodeforcesPage;
