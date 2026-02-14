import { useId } from 'react';
import { Tooltip } from 'react-tooltip';
import {
  addDays,
  eachWeekOfInterval,
  endOfWeek,
  format,
  isSameMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { motion } from 'framer-motion';

const SixMonthActivityCard = ({ submissionCalendar = {}, title = '6-Month Activity' }) => {
  const tooltipId = useId().replace(/:/g, '');
  const startDate = startOfWeek(subMonths(new Date(), 6), { weekStartsOn: 0 });
  const endDate = new Date();
  const endDateAligned = endOfWeek(endDate, { weekStartsOn: 0 });
  const weeks = eachWeekOfInterval(
    { start: startDate, end: endDateAligned },
    { weekStartsOn: 0 }
  );
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const monthMarkers = weeks
    .map((weekStart, weekIndex) => ({ weekStart, weekIndex }))
    .filter(({ weekStart, weekIndex }) => {
      if (weekIndex === 0) return true;
      return !isSameMonth(weekStart, weeks[weekIndex - 1]);
    });

  const getCellStyle = (count) => {
    if (count === 0) return { backgroundColor: 'var(--surface-muted)' };
    if (count < 3) return { backgroundColor: 'color-mix(in srgb, var(--brand-color) 42%, transparent)' };
    if (count < 6) return { backgroundColor: 'color-mix(in srgb, var(--brand-color) 58%, transparent)' };
    return { backgroundColor: 'color-mix(in srgb, var(--brand-color) 78%, transparent)' };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[var(--border-muted)] bg-[var(--surface)] p-6 shadow-lg backdrop-blur-sm"
    >
      <h3 className="mb-6 text-xl font-semibold text-[var(--brand-color)]">{title}</h3>

      <div className="overflow-x-auto pb-2">
        <div className="inline-block min-w-full">
          <div className="mb-2 pl-9">
            <div className="relative h-4" style={{ width: `${weeks.length * 20}px` }}>
              {monthMarkers.map(({ weekStart, weekIndex }) => (
                <span
                  key={`${format(weekStart, 'yyyy-MM')}-${weekIndex}`}
                  className="absolute text-xs font-medium text-[var(--text-muted)]"
                  style={{ left: `${weekIndex * 20}px` }}
                >
                  {format(weekStart, 'MMM')}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex min-w-[28px] flex-col gap-1 text-xs text-[var(--text-muted)]">
              {weekDays.map((day, i) => (
                <div key={day} className="flex h-4 items-center">
                  {i % 2 === 0 ? day : ''}
                </div>
              ))}
            </div>

            <div className="flex gap-1" style={{ width: `${weeks.length * 20}px` }}>
              {weeks.map((weekStart, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {Array.from({ length: 7 }).map((_, dayOffset) => {
                    const day = addDays(weekStart, dayOffset);
                    const dateString = format(day, 'yyyy-MM-dd');
                    const count = Number(submissionCalendar[dateString] || 0);
                    return (
                      <div
                        key={dateString}
                        data-tooltip-id={tooltipId}
                        data-tooltip-content={`${format(day, 'MMM dd, yyyy')} - ${count} submission${count !== 1 ? 's' : ''}`}
                        className="h-4 w-4 cursor-pointer rounded-sm transition-transform hover:scale-110"
                        style={getCellStyle(count)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2 text-xs text-[var(--text-muted)]">
        <span>Less</span>
        {[0, 1, 2, 3].map((level) => (
          <div
            key={level}
            className="h-3 w-3 rounded-sm"
            style={getCellStyle(level * 2)}
          />
        ))}
        <span>More</span>
      </div>

      <Tooltip
        id={tooltipId}
        className="!rounded-lg !px-3 !py-2 !text-sm !shadow-lg"
        style={{
          backgroundColor: 'var(--surface-strong)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-muted)',
        }}
        place="top"
      />
    </motion.div>
  );
};

export default SixMonthActivityCard;
