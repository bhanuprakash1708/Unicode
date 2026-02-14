import { useEffect, useMemo, useState } from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { FiExternalLink, FiMail, FiMapPin } from "react-icons/fi";
import { SiCodechef, SiCodeforces, SiLeetcode } from "react-icons/si";
import Header from "../components/Header";
import CombinedHeatmap from "../components/CombinedHeatmap";
import { UserAuth } from "../context/AuthContext";
import { useUserProfile } from "../context/UserProfileContext";

const Dashboard = () => {
  const { profileData } = useUserProfile();
  const { session } = UserAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const API_BASE = import.meta.env.VITE_BACKEND_URL ?? "";

  const user = {
    name: profileData?.name || "",
    email: profileData?.email || "",
    linkedin: profileData?.linkedin || "",
    github: profileData?.github || "",
    organization: profileData?.education || "",
    location: profileData?.location || "",
    work: profileData?.work || "",
    codeforces_username: profileData?.codeforces_username || "",
    leetcode_username: profileData?.leetcode_username || "",
    codechef_username: profileData?.codechef_username || "",
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session?.user?.id) return;
      try {
        const response = await fetch(`${API_BASE}/api/dashboard/${session.user.id}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch dashboard data");
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchDashboardData();
  }, [
    API_BASE,
    session?.access_token,
    session?.user?.id,
    profileData?.leetcode_username,
    profileData?.codechef_username,
    profileData?.codeforces_username,
  ]);

  const avatar = user.name ? user.name.charAt(0).toUpperCase() : "U";

  const totalQuestionsSolved = useMemo(() => {
    if (!dashboardData?.total_questions?.length) return 0;
    const totals = dashboardData.total_questions[0];
    return (
      (totals.leetcode_total ?? totals.leetcode_count ?? 0) +
      (totals.codechef_total ?? totals.codechef_count ?? 0) +
      (totals.codeforces_total ?? totals.codeforces_count ?? 0)
    );
  }, [dashboardData?.total_questions]);

  const getPlatformQuestions = (platform) => {
    if (!dashboardData?.total_questions?.length) return 0;
    const row = dashboardData.total_questions[0];
    return row[`${platform}_total`] ?? row[`${platform}_count`] ?? 0;
  };

  const getContestRating = (platform) => {
    if (!dashboardData?.contest_ranking_info?.length) return null;
    const data = dashboardData.contest_ranking_info[0];
    if (platform === "leetcode") {
      return {
        recent: data.leetcode_recent_contest_rating,
        max: data.leetcode_max_contest_rating,
      };
    }
    if (platform === "codechef") {
      return {
        stars: data.codechef_stars,
        recent: data.codechef_recent_contest_rating,
        max: data.codechef_max_contest_rating,
      };
    }
    if (platform === "codeforces") {
      return {
        recent: data.codeforces_recent_contest_rating,
        max: data.codeforces_max_contest_rating,
      };
    }
    return null;
  };

  const ratings = {
    leetcode: getContestRating("leetcode"),
    codechef: getContestRating("codechef"),
    codeforces: getContestRating("codeforces"),
  };

  return (
    <div className="min-h-screen bg-app text-[var(--text-primary)]">
      <Header />
      <main className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[300px,1fr] lg:px-8">
        <aside className="rounded-3xl border border-[var(--border-muted)] bg-[var(--surface)] p-5 shadow-lg backdrop-blur-sm">
          <div className="mb-5 flex items-center gap-4">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-color)] text-2xl font-bold text-white">
              {avatar}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold">{user.name || "Your Profile"}</h1>
              <p className="flex items-center gap-2 truncate text-sm text-[var(--text-muted)]">
                <FiMail className="h-4 w-4" />
                {user.email || "No email"}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            {user.location && (
              <p className="flex items-center gap-2 text-[var(--text-muted)]">
                <FiMapPin className="h-4 w-4" />
                {user.location}
              </p>
            )}
            {user.organization && <p className="text-[var(--text-muted)]">Education: {user.organization}</p>}
            {user.work && <p className="text-[var(--text-muted)]">Work: {user.work}</p>}
          </div>

          <div className="mt-6 rounded-2xl border border-[var(--border-muted)] bg-[var(--surface-strong)] p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Profiles</p>
            <div className="space-y-2">
              {user.leetcode_username && (
                <a
                  href={`https://leetcode.com/u/${user.leetcode_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-[var(--surface-muted)]"
                >
                  <span className="inline-flex items-center gap-2"><SiLeetcode className="text-amber-500" /> LeetCode</span>
                  <FiExternalLink className="h-4 w-4 text-[var(--text-muted)]" />
                </a>
              )}
              {user.codechef_username && (
                <a
                  href={`https://www.codechef.com/users/${user.codechef_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-[var(--surface-muted)]"
                >
                  <span className="inline-flex items-center gap-2"><SiCodechef className="text-rose-500" /> CodeChef</span>
                  <FiExternalLink className="h-4 w-4 text-[var(--text-muted)]" />
                </a>
              )}
              {user.codeforces_username && (
                <a
                  href={`https://codeforces.com/profile/${user.codeforces_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-[var(--surface-muted)]"
                >
                  <span className="inline-flex items-center gap-2"><SiCodeforces className="text-blue-500" /> Codeforces</span>
                  <FiExternalLink className="h-4 w-4 text-[var(--text-muted)]" />
                </a>
              )}
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            {user.linkedin && (
              <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-[var(--border-muted)] p-2 hover:bg-[var(--surface-muted)]">
                <FaLinkedin className="h-4 w-4 text-blue-500" />
              </a>
            )}
            {user.github && (
              <a href={user.github} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-[var(--border-muted)] p-2 hover:bg-[var(--surface-muted)]">
                <FaGithub className="h-4 w-4" />
              </a>
            )}
          </div>
        </aside>

        <section className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-[var(--border-muted)] bg-[var(--surface)] p-5 shadow-sm">
              <p className="text-sm text-[var(--text-muted)]">Total Solved</p>
              <p className="mt-2 text-3xl font-semibold">{totalQuestionsSolved}</p>
            </div>
            <div className="rounded-2xl border border-[var(--border-muted)] bg-[var(--surface)] p-5 shadow-sm">
              <p className="text-sm text-[var(--text-muted)]">LeetCode</p>
              <p className="mt-2 text-3xl font-semibold">{getPlatformQuestions("leetcode")}</p>
            </div>
            <div className="rounded-2xl border border-[var(--border-muted)] bg-[var(--surface)] p-5 shadow-sm">
              <p className="text-sm text-[var(--text-muted)]">CodeChef</p>
              <p className="mt-2 text-3xl font-semibold">{getPlatformQuestions("codechef")}</p>
            </div>
            <div className="rounded-2xl border border-[var(--border-muted)] bg-[var(--surface)] p-5 shadow-sm">
              <p className="text-sm text-[var(--text-muted)]">Codeforces</p>
              <p className="mt-2 text-3xl font-semibold">{getPlatformQuestions("codeforces")}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--border-muted)] bg-[var(--surface)] p-4 shadow-sm backdrop-blur-sm">
            <CombinedHeatmap profileData={profileData} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {[
              { key: "leetcode", title: "LeetCode Rating", color: "bg-amber-500", maxDefault: 2500 },
              { key: "codechef", title: "CodeChef Rating", color: "bg-rose-500", maxDefault: 5000 },
              { key: "codeforces", title: "Codeforces Rating", color: "bg-blue-500", maxDefault: 3500 },
            ].map((item) => {
              const rating = ratings[item.key];
              if (!rating) return null;
              const recent = Number(rating.recent || 0);
              const max = Number(rating.max || item.maxDefault);
              const width = Math.min(100, max > 0 ? (recent / max) * 100 : 0);
              return (
                <article
                  key={item.key}
                  className="rounded-2xl border border-[var(--border-muted)] bg-[var(--surface)] p-5 shadow-sm"
                >
                  <h3 className="text-sm font-semibold text-[var(--text-muted)]">{item.title}</h3>
                  <p className="mt-2 text-3xl font-semibold">{rating.recent ?? "N/A"}</p>
                  {item.key === "codechef" && rating.stars ? (
                    <p className="mt-1 text-xs text-[var(--text-muted)]">Stars: {"*".repeat(rating.stars)}</p>
                  ) : null}
                  <div className="mt-4 h-2 w-full rounded-full bg-[var(--surface-muted)]">
                    <div className={`${item.color} h-2 rounded-full`} style={{ width: `${width}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-[var(--text-muted)]">Max: {rating.max ?? "N/A"}</p>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
