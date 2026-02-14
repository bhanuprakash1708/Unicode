import { ArrowRight, BarChart3, CalendarClock, Moon, ShieldCheck, Sun, Trophy } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const features = [
  {
    title: "Unified Progress Tracking",
    description: "Connect LeetCode, CodeChef, and Codeforces into one clean dashboard with platform-level insights.",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    title: "Contest Intelligence",
    description: "See upcoming, ongoing, and completed contests in one place with accurate status and reminders.",
    icon: <CalendarClock className="h-5 w-5" />,
  },
  {
    title: "Performance Confidence",
    description: "Measure rating trends, solved counts, and growth signals with clear visual hierarchy.",
    icon: <Trophy className="h-5 w-5" />,
  },
  {
    title: "Privacy First",
    description: "Your profile integrations and analytics stay tied to your account with secure auth flows.",
    icon: <ShieldCheck className="h-5 w-5" />,
  },
];

const Start = () => {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen text-[var(--text-primary)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border-muted)] bg-[var(--header-bg)] backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-color)]">
              {"</>"}
            </span>
            <div>
              <p className="text-lg font-semibold">Unicode</p>
              <p className="text-xs text-[var(--text-muted)]">Competitive Programming Tracker</p>
            </div>
          </a>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-muted)] bg-[var(--surface-muted)] transition hover:border-[var(--brand-color)]"
              aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
            >
              {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <a
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--surface-muted)]"
            >
              Login
            </a>
            <a
              href="/signup"
              className="rounded-lg bg-[var(--brand-color)] px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Create Account
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24 lg:px-8">
          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-[var(--border-muted)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--brand-color)]">
              Modern CP Workflow
            </span>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Track your coding performance with clarity and momentum.
            </h1>
            <p className="max-w-xl text-base text-[var(--text-muted)] sm:text-lg">
              Unicode centralizes your coding profiles, contest pipeline, and analytics so you can focus on improving instead of switching tabs.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-color)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-muted)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--surface-muted)]"
              >
                Open Dashboard
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-[var(--border-muted)] bg-[var(--surface)] p-6 shadow-xl backdrop-blur-sm">
              <div className="mb-6 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-[var(--surface-muted)] p-3">
                  <p className="text-xs text-[var(--text-muted)]">Total Solved</p>
                  <p className="mt-1 text-xl font-semibold">2,184</p>
                </div>
                <div className="rounded-xl bg-[var(--surface-muted)] p-3">
                  <p className="text-xs text-[var(--text-muted)]">Active Streak</p>
                  <p className="mt-1 text-xl font-semibold">31 days</p>
                </div>
                <div className="rounded-xl bg-[var(--surface-muted)] p-3">
                  <p className="text-xs text-[var(--text-muted)]">Live Contests</p>
                  <p className="mt-1 text-xl font-semibold">2</p>
                </div>
              </div>
              <div className="rounded-2xl border border-[var(--border-muted)] bg-[var(--surface-strong)] p-4">
                <p className="text-sm font-semibold">Next Contest</p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">Codeforces Round #1043</p>
                <p className="mt-2 text-xs text-[var(--brand-color)]">Starts in 2h 14m</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold sm:text-3xl">Everything in one clean workflow</h2>
            <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)] sm:text-base">
              A consistent UI system built for fast scanning, better decisions, and daily practice.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-[var(--border-muted)] bg-[var(--surface)] p-5 shadow-sm backdrop-blur-sm"
              >
                <div className="mb-3 inline-flex rounded-lg bg-[var(--brand-soft)] p-2 text-[var(--brand-color)]">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-[var(--text-muted)]">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Start;
