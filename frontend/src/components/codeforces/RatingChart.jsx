import { useMemo } from 'react';
import { subMonths, startOfDay, format } from 'date-fns';
import Chart from 'react-apexcharts';

const RatingChart = ({ ratingHistory }) => {
  const sixMonthsAgo = startOfDay(subMonths(new Date(), 6)).getTime();
  const filteredData = ratingHistory
    .filter(contest => contest.ratingUpdateTimeSeconds * 1000 >= sixMonthsAgo)
    .map(contest => ({
      x: contest.ratingUpdateTimeSeconds * 1000,
      y: contest.newRating,
      rank: contest.rank
    }));

  const isDark = typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark';
  const textMuted = typeof document !== 'undefined'
    ? getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#94a3b8'
    : '#94a3b8';
  const borderMuted = typeof document !== 'undefined'
    ? getComputedStyle(document.documentElement).getPropertyValue('--border-muted').trim() || 'rgba(148, 163, 184, 0.26)'
    : 'rgba(148, 163, 184, 0.26)';

  const options = useMemo(() => ({
    chart: {
      type: 'area',
      height: 400,
      foreColor: textMuted,
      toolbar: { show: true },
      zoom: { enabled: false },
      background: 'transparent'
    },
    colors: ['#3B82F6'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 100]
      }
    },
    xaxis: {
      type: 'datetime',
      min: sixMonthsAgo,
      max: new Date().getTime(),
      labels: {
        style: { colors: textMuted },
        format: 'MMM dd',
        rotate: -45
      },
      axisBorder: { show: false }
    },
    yaxis: {
      labels: { 
        style: { colors: textMuted } 
      },
      forceNiceScale: true
    },
    annotations: {
      points: filteredData.map((contest) => ({
        x: contest.x,
        y: contest.y,
        marker: {
          size: 6,
          fillColor: '#fff',
          strokeColor: '#3B82F6',
          radius: 2
        },
        label: {
          text: `#${contest.rank}`,
          style: {
            color: '#fff',
            background: '#3B82F6',
            fontSize: '12px',
            padding: { left: 5, right: 5, top: 2, bottom: 2 }
          }
        }
      }))
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      x: {
        formatter: (val) => format(new Date(val), 'MMM dd, yyyy HH:mm')
      }
    },
    grid: {
      borderColor: borderMuted,
      strokeDashArray: 4
    }
  }), [borderMuted, filteredData, isDark, sixMonthsAgo, textMuted]);

  const series = [{
    name: 'Rating',
    data: filteredData
  }];

  return (
    <div className="rounded-xl border border-[var(--border-muted)] bg-[var(--surface)] p-6 shadow-lg backdrop-blur-sm">
      <h3 className="mb-4 text-xl font-semibold text-[var(--brand-color)]">
        Rating History (Last 6 Months)
      </h3>
      <Chart 
        options={options} 
        series={series} 
        type="area" 
        height={400} 
      />
    </div>
  );
};

export default RatingChart;
