import { Tooltip } from 'react-tooltip';
import { format, eachDayOfInterval, subMonths, startOfMonth } from 'date-fns';
import { motion } from 'framer-motion';

const CalendarHeatmap = ({ submissionCalendar }) => {
  const calendar = submissionCalendar ?? {};
  const startDate = subMonths(new Date(), 6);
  const endDate = new Date();
  const allDays = eachDayOfInterval({ start: startDate, end: endDate });
  
  const months = [];
  let currentMonth = null;
  
  allDays.forEach(day => {
    const monthStart = startOfMonth(day);
    if (!currentMonth || monthStart.getTime() !== currentMonth.date.getTime()) {
      currentMonth = {
        date: monthStart,
        label: format(monthStart, 'MMM yyyy'),
        position: months.length
      };
      months.push(currentMonth);
    }
  });

  const weeks = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  const getCellStyle = (count) => {
    if (count === 0) return { backgroundColor: 'var(--surface-muted)' };
    if (count < 3) return { backgroundColor: 'color-mix(in srgb, var(--brand-color) 42%, transparent)' };
    if (count < 5) return { backgroundColor: 'color-mix(in srgb, var(--brand-color) 58%, transparent)' };
    return { backgroundColor: 'color-mix(in srgb, var(--brand-color) 78%, transparent)' };
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-xl border border-[var(--border-muted)] bg-[var(--surface)] p-6 shadow-lg backdrop-blur-sm"
    >
      <h3 className="mb-6 text-xl font-semibold text-[var(--brand-color)]">6-Month Activity</h3>
      
      <div className="flex gap-1 mb-2 ml-8">
        {months.map((month) => (
          <div
            key={month.date}
            className="text-xs font-medium text-[var(--text-muted)]"
            style={{ 
              width: `${(weeks.length / months.length) * 100}%`,
              minWidth: '60px'
            }}
          >
            {month.label}
          </div>
        ))}
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-1">
          {weeks.map((week, weekIndex) => {
            const weekStartMonth = startOfMonth(week[0]);
            const showMonthLabel = months.some(m => 
              m.date.getTime() === weekStartMonth.getTime() && 
              week.some(day => day.getDate() === 1)
            );

            return (
              <div key={weekIndex} className="flex flex-col gap-1 relative">
                {showMonthLabel && (
                  <div className="absolute -top-6 left-0 text-xs text-[var(--text-muted)]">
                    {format(weekStartMonth, 'MMM')}
                  </div>
                )}
                {week.map((day) => {
                  const dateString = format(day, 'yyyy-MM-dd');
                  const count = calendar[dateString] || 0;
                  
                  return (
                    <div
                      key={dateString}
                      data-tooltip-id="heatmap-tooltip"
                      data-tooltip-content={`${format(day, 'MMM dd, yyyy')} - ${count} submission${count !== 1 ? 's' : ''}`}
                      className="h-4 w-4 cursor-pointer rounded-sm transition-all hover:scale-110"
                      style={getCellStyle(count)}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <Tooltip
        id="heatmap-tooltip"
        className="!rounded-lg !px-3 !py-2 !text-sm !shadow-lg"
        style={{
          backgroundColor: 'var(--surface-strong)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-muted)'
        }}
        place="top"
      />
      
      <div className="absolute left-2 top-16 flex flex-col gap-1 text-xs text-[var(--text-muted)]">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
          <div key={day} className="h-4 flex items-center">
            {i % 2 === 0 && day}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default CalendarHeatmap;
