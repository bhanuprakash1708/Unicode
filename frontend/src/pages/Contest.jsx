import { useEffect, useMemo, useState } from "react";
import { ChartPieIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import ContestCard from "../components/ContestCard";
import PlatformFilter from "../components/PlatformFilter";
import Header from "../components/Header";
import ContestCalendar from "../components/ContestCalendar";

const statusTabs = [
  { id: "all", label: "All" },
  { id: "upcoming", label: "Upcoming" },
  { id: "ongoing", label: "Ongoing" },
  { id: "completed", label: "Completed" },
];

const getContestStatus = (startTime, endTime) => {
  const now = Date.now();
  if (now < startTime) return "upcoming";
  if (now <= endTime) return "ongoing";
  return "completed";
};

const parseDurationToMinutes = (durationText) => {
  if (!durationText || typeof durationText !== "string") return 0;
  const [time, unit] = durationText.trim().split(" ");
  const timeValue = Number.parseFloat(time);
  if (!Number.isFinite(timeValue)) return 0;
  return unit?.toLowerCase().includes("hour")
    ? Math.round(timeValue * 60)
    : Math.round(timeValue);
};

const Contest = () => {
  const [contests, setContests] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const API_BASE = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchContests = async () => {
      setLoading(true);
      setError("");
      try {
        let data;
        const allResponse = await fetch(`${API_BASE}/api/contests/all`);
        if (allResponse.ok) {
          data = await allResponse.json();
        } else {
          const fallbackResponse = await fetch(`${API_BASE}/api/contests/upcoming`);
          data = await fallbackResponse.json();
        }

        if (data?.success) {
          const transformedContests = data.contests.map((contest) => {
            const startTime = Number(contest.startTime);
            const endTime = Number(contest.endTime);
            const durationMinutes = Number.isFinite(contest.durationMinutes)
              ? contest.durationMinutes
              : parseDurationToMinutes(contest.duration);

            return {
              id: `${contest.platform}-${contest.name}-${startTime}`,
              title: contest.name,
              platform: (contest.platform || "unknown").toLowerCase(),
              startTime,
              endTime,
              durationMinutes,
              url: contest.url,
              status: contest.status || getContestStatus(startTime, endTime),
            };
          }).filter((contest) => Number.isFinite(contest.startTime) && Number.isFinite(contest.endTime));
          setContests(transformedContests);
        } else {
          throw new Error("Unable to fetch contests");
        }
      } catch (fetchError) {
        console.error("Error fetching contests:", fetchError);
        setError("Could not load contests. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, [API_BASE]);

  const stats = useMemo(
    () => ({
      total: contests.length,
      upcoming: contests.filter((contest) => contest.status === "upcoming").length,
      ongoing: contests.filter((contest) => contest.status === "ongoing").length,
      completed: contests.filter((contest) => contest.status === "completed").length,
    }),
    [contests]
  );

  const filteredContests = useMemo(
    () =>
      contests.filter((contest) => {
        const matchesPlatform =
          selectedPlatform === "all" || contest.platform === selectedPlatform;
        const matchesStatus = selectedStatus === "all" || contest.status === selectedStatus;
        const matchesSearch = contest.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        return matchesPlatform && matchesStatus && matchesSearch;
      }),
    [contests, selectedPlatform, selectedStatus, searchQuery]
  );

  const completedContests = useMemo(
    () =>
      filteredContests
        .filter((contest) => contest.status === "completed")
        .sort((a, b) => b.endTime - a.endTime),
    [filteredContests]
  );

  return (
    <div className="min-h-screen bg-app text-[var(--text-primary)]">
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-3xl border border-[var(--border-muted)] bg-[var(--surface)] p-6 shadow-xl backdrop-blur-sm">
          <h1 className="text-3xl font-semibold tracking-tight">Contests</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Unified timeline for past, ongoing, and upcoming contests across platforms.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedStatus(tab.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${
                  selectedStatus === tab.id
                    ? "bg-[var(--brand-color)] text-white"
                    : "border border-[var(--border-muted)] bg-[var(--surface-strong)] text-[var(--text-primary)] hover:bg-[var(--surface-muted)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <section className="space-y-6 lg:col-span-2">
            <PlatformFilter
              selectedPlatform={selectedPlatform}
              setSelectedPlatform={setSelectedPlatform}
            />
            <label className="relative block">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="search"
                placeholder="Search contests"
                className="w-full rounded-xl border border-[var(--border-muted)] bg-[var(--surface-strong)] py-3 pl-10 pr-4 text-[var(--text-primary)] outline-none transition focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]/40"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                aria-label="Search contests"
              />
            </label>

            <div className="max-h-[42rem] space-y-4 overflow-y-auto rounded-2xl border border-[var(--border-muted)] bg-[var(--surface)] p-4 shadow-lg scrollbar-thin">
              {loading ? (
                [...Array(4)].map((_, index) => (
                  <div key={index} className="h-28 animate-pulse rounded-2xl bg-[var(--surface-muted)]" />
                ))
              ) : error ? (
                <p className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
                  {error}
                </p>
              ) : filteredContests.length > 0 ? (
                <>
                  {filteredContests.map((contest) => (
                    <ContestCard key={contest.id} contest={contest} />
                  ))}
                </>
              ) : (
                <p className="rounded-xl border border-[var(--border-muted)] bg-[var(--surface-strong)] p-4 text-sm text-[var(--text-muted)]">
                  No contests match your current filters.
                </p>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-[var(--border-muted)] bg-[var(--surface)] p-6 shadow-xl backdrop-blur-sm">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <ChartPieIcon className="h-6 w-6 text-[var(--brand-color)]" />
                Contest Stats
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Total</span>
                  <span className="font-semibold">{stats.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Upcoming</span>
                  <span className="font-semibold text-sky-500">{stats.upcoming}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Ongoing</span>
                  <span className="font-semibold text-amber-500">{stats.ongoing}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Completed</span>
                  <span className="font-semibold text-emerald-500">{stats.completed}</span>
                </div>
              </div>
            </div>

            <ContestCalendar contests={filteredContests} />
          </aside>
        </div>

        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Previous Contests</h2>
          {loading ? (
            <div className="h-24 animate-pulse rounded-xl bg-[var(--surface-muted)]" />
          ) : completedContests.length > 0 ? (
            <div className="space-y-4">
              {completedContests.slice(0, 10).map((contest) => (
                <ContestCard key={`completed-${contest.id}`} contest={contest} />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-[var(--border-muted)] bg-[var(--surface-strong)] p-4 text-sm text-[var(--text-muted)]">
              No completed contests found for the current filter.
            </p>
          )}
        </section>
      </main>
    </div>
  );
};

export default Contest;
