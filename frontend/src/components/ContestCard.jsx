import { format, formatDistanceToNow } from "date-fns";
import GoogleCalendarButton from "./GoogleCalendarButton";

const platformColors = {
  leetcode: "border-orange-500/35 bg-orange-500/10 text-orange-600",
  codeforces: "border-blue-500/35 bg-blue-500/10 text-blue-600",
  codechef: "border-yellow-500/35 bg-yellow-500/10 text-yellow-700",
};

const statusStyles = {
  upcoming: "border-sky-500/35 bg-sky-500/10 text-sky-600",
  ongoing: "border-amber-500/35 bg-amber-500/10 text-amber-700",
  completed: "border-emerald-500/35 bg-emerald-500/10 text-emerald-700",
};

const getStatus = (contest) => {
  if (contest.status) return contest.status;
  const now = Date.now();
  if (now < contest.startTime) return "upcoming";
  if (now <= contest.endTime) return "ongoing";
  return "completed";
};

const ContestCard = ({ contest }) => {
  const startDate = new Date(contest.startTime);
  const endDate = new Date(contest.endTime);
  const status = getStatus(contest);

  return (
    <article
      className="rounded-2xl border border-[var(--border-muted)] bg-[var(--surface-strong)] p-5 shadow-lg transition hover:border-[var(--ring)]/40"
      aria-label={`${contest.title} contest card`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-medium uppercase tracking-wide ${
                platformColors[contest.platform] || "border-[var(--border-muted)] bg-[var(--surface-muted)] text-[var(--text-primary)]"
              }`}
            >
              {contest.platform}
            </span>
            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-medium uppercase tracking-wide ${
                statusStyles[status] || "border-[var(--border-muted)] bg-[var(--surface-muted)] text-[var(--text-primary)]"
              }`}
            >
              {status}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">{contest.title}</h3>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Starts {format(startDate, "MMM d, yyyy h:mm a")} and ends{" "}
            {format(endDate, "MMM d, yyyy h:mm a")}
          </p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Duration: {contest.durationMinutes || 0} minutes
          </p>
        </div>

        <div className="text-sm text-[var(--text-muted)] sm:text-right">
          <p>{formatDistanceToNow(startDate, { addSuffix: true })}</p>
          {status === "completed" && <p className="text-emerald-600">Ended</p>}
          {status === "ongoing" && <p className="text-amber-600">Live now</p>}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <GoogleCalendarButton contest={contest} />
        <a
          href={contest.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand-color)] transition hover:opacity-80"
        >
          Open contest
          <span aria-hidden="true">{"->"}</span>
        </a>
      </div>
    </article>
  );
};

export default ContestCard;
