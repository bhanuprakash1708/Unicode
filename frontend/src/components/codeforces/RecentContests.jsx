import { motion } from 'framer-motion';

const RecentContests = ({ contests=[] }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="rounded-xl border border-[var(--border-muted)] bg-[var(--surface)] p-6 shadow-lg backdrop-blur-sm"
  >
    <h3 className="mb-4 text-xl font-semibold text-[var(--brand-color)]">Recent Contests</h3>
    <div className="space-y-3">
      {contests.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[var(--border-muted)] bg-[var(--surface-strong)] p-4 text-sm text-[var(--text-muted)]">
          No recent contests found.
        </p>
      ) : null}
      {contests.map((contest, idx) => (
        <motion.div
          key={contest.contestId}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="flex items-center justify-between rounded-lg border border-[var(--border-muted)] bg-[var(--surface-strong)] p-4 transition-colors hover:bg-[var(--surface-muted)]"
        >
          <div>
            <h4 className="font-medium text-[var(--text-primary)]">{contest.contestName}</h4>
            <p className="text-sm text-[var(--text-muted)]">
              {new Date(contest.ratingUpdateTimeSeconds * 1000).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-green-400">Rank: {contest.rank}</p>
            <p className={`${contest.newRating > contest.oldRating ? 'text-green-400' : 'text-red-400'}`}>
              {contest.newRating - contest.oldRating} points
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

export default RecentContests;
