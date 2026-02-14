// src/components/PlatformFilter.jsx
const platforms = [
  { id: 'all', name: 'All Platforms' },
  { id: 'leetcode', name: 'LeetCode' },
  { id: 'codeforces', name: 'Codeforces' },
  { id: 'codechef', name: 'CodeChef' },
];

const PlatformFilter = ({ selectedPlatform, setSelectedPlatform }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {platforms.map((platform) => (
        <button
          key={platform.id}
          type="button"
          onClick={() => setSelectedPlatform(platform.id)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${
            selectedPlatform === platform.id
              ? 'bg-[var(--brand-color)] text-white'
              : 'border border-[var(--border-muted)] bg-[var(--surface-strong)] text-[var(--text-primary)] hover:bg-[var(--surface-muted)]'
          }`}
        >
          {platform.name}
        </button>
      ))}
    </div>
  );
};

export default PlatformFilter;
