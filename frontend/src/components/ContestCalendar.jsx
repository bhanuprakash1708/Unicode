import { useMemo, useState } from "react";
import { CalendarIcon } from "@heroicons/react/24/outline";

const ContestCalendar = ({ contests }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const calendarEvents = useMemo(() => {
    const events = {};
    contests.forEach((contest) => {
      const date = new Date(contest.startTime);
      const day = date.getDate();
      const month = date.getMonth();
      const year = date.getFullYear();
      const key = `${year}-${month}-${day}`;
      if (!events[key]) events[key] = [];
      events[key].push(contest);
    });
    return events;
  }, [contests]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOfWeek = new Date(year, month, 1).getDay();
  const today = new Date();

  const calendarDays = Array.from({ length: startDayOfWeek + daysInMonth }, (_, i) => {
    if (i < startDayOfWeek) return <div key={`empty-${i}`} />;

    const day = i - startDayOfWeek + 1;
    const key = `${year}-${month}-${day}`;
    const hasEvents = calendarEvents[key];
    const isToday =
      day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

    return (
      <button
        key={day}
        type="button"
        className={`relative aspect-square rounded-lg p-1 text-sm ${
          isToday ? "bg-[var(--brand-soft)]" : ""
        } ${hasEvents ? "hover:bg-[var(--brand-soft)]" : "opacity-50"} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]`}
        onClick={() => hasEvents && setSelectedDate({ day, key })}
        disabled={!hasEvents}
      >
        <div className={`text-center ${hasEvents ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>{day}</div>
        {hasEvents && (
          <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1">
            {calendarEvents[key].slice(0, 3).map((_, index) => (
              <div key={index} className="h-1 w-1 rounded-full bg-[var(--brand-color)]" />
            ))}
          </div>
        )}
      </button>
    );
  });

  const handleMonthChange = (direction) => {
    setCurrentMonth((previous) => new Date(previous.getFullYear(), previous.getMonth() + direction, 1));
  };

  return (
    <section className="rounded-2xl border border-[var(--border-muted)] bg-[var(--surface)] p-6 shadow-xl backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <CalendarIcon className="h-6 w-6 text-[var(--brand-color)]" />
          Contest Calendar
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleMonthChange(-1)}
            className="rounded p-1 text-[var(--text-primary)] transition hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            aria-label="Go to previous month"
          >
            {"<"}
          </button>
          <button
            type="button"
            onClick={() => handleMonthChange(1)}
            className="rounded p-1 text-[var(--text-primary)] transition hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            aria-label="Go to next month"
          >
            {">"}
          </button>
        </div>
      </div>

      <div className="mb-2 text-center text-lg font-medium text-[var(--text-primary)]">
        {currentMonth.toLocaleString("default", { month: "long" })} {year}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayLabel) => (
          <div key={dayLabel} className="p-1 text-center text-xs text-[var(--text-muted)]">
            {dayLabel}
          </div>
        ))}
        {calendarDays}
      </div>

      {selectedDate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
          onClick={() => setSelectedDate(null)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-[var(--border-muted)] bg-[var(--surface-strong)] p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="mb-4 text-xl font-semibold text-[var(--text-primary)]">
              Contests on {selectedDate.day}{" "}
              {currentMonth.toLocaleString("default", { month: "long" })}
            </h3>
            <div className="space-y-2">
              {calendarEvents[selectedDate.key].map((contest) => (
                <a
                  key={contest.id}
                  href={contest.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg border border-[var(--border-muted)] bg-[var(--surface)] p-3 transition-colors hover:bg-[var(--surface-muted)]"
                >
                  <div className="font-medium text-[var(--text-primary)]">{contest.title}</div>
                  <div className="text-sm text-[var(--text-muted)]">
                    {new Date(contest.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ContestCalendar;
