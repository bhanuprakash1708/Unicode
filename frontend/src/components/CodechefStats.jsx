import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChevronUp, ChevronDown, Award, Star, Code, Users, TrendingUp } from 'lucide-react';
import { IoStarSharp } from "react-icons/io5";

const CodeChefStats = ({ data }) => {
  const [expandedSections, setExpandedSections] = useState({
    profile: true,
    analysis: true,
    heatmap: true,
    contest: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-[var(--border-muted)] bg-[var(--surface-strong)] text-[var(--text-primary)]">
        <div className="text-xl text-red-400">No profile data available</div>
      </div>
    );
  }

  const { profileInfo, analysis, submissionHeatmap, contestGraph } = data;

  // Format contest history data for chart
  const chartData = contestGraph.contestHistory.map(contest => ({
    name: contest.contestName.replace('Starters ', 'S').replace(' (Rated)', '').replace(' (rated)', ''),
    rating: parseInt(contest.rating),
    date: contest.date
  }));

  // Function to render stars based on count
  const renderStars = (count) => {
    return (
      <div className="flex justify-center mb-2">
        {Array.from({ length: count }).map((_, i) => (
          <IoStarSharp key={i} className="text-yellow-400 text-4xl mx-0.5" />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-[var(--border-muted)] bg-[var(--surface)] p-6 text-center text-[var(--text-primary)] shadow-lg">
        <div className="flex flex-col items-center">
          {/* Rating Display - Centered */}
          <div className="flex flex-col items-center mb-4">
            {profileInfo.stars && renderStars(profileInfo.stars)}
            <div className="text-4xl font-bold text-white mb-1">{profileInfo.rating}</div>
            <div className="flex items-center gap-1 text-[var(--text-muted)]">
              <span>Highest: {profileInfo.highestRating}</span>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 w-full max-w-md mx-auto">
            <div className="rounded-lg border border-[var(--border-muted)] bg-[var(--surface-strong)] p-3">
              <div className="text-sm text-[var(--text-muted)]">Global Rank</div>
              <div className="text-xl font-bold text-blue-400">#{profileInfo.ranks.global}</div>
            </div>
            <div className="rounded-lg border border-[var(--border-muted)] bg-[var(--surface-strong)] p-3">
              <div className="text-sm text-[var(--text-muted)]">Country Rank</div>
              <div className="text-xl font-bold text-blue-400">#{profileInfo.ranks.country}</div>
            </div>
            <div className="rounded-lg border border-[var(--border-muted)] bg-[var(--surface-strong)] p-3">
              <div className="text-sm text-[var(--text-muted)]">Problems Solved</div>
              <div className="text-xl font-bold text-green-400">{profileInfo.problemsSolved}</div>
            </div>
            <div className="rounded-lg border border-[var(--border-muted)] bg-[var(--surface-strong)] p-3">
              <div className="text-sm text-[var(--text-muted)]">Active Days</div>
              <div className="text-xl font-bold text-purple-400">{submissionHeatmap.activeDays}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-[var(--border-muted)] bg-[var(--surface)] text-[var(--text-primary)] shadow-lg">
        <div 
          className="flex cursor-pointer items-center justify-between border-b border-[var(--border-muted)] bg-[var(--surface-muted)] p-4"
          onClick={() => toggleSection('analysis')}
        >
          <h2 className="text-xl font-semibold flex items-center">
            <Award className="mr-2 text-blue-400" /> Performance Analysis
          </h2>
          {expandedSections.analysis ? 
            <ChevronUp className="text-blue-400" /> : 
            <ChevronDown className="text-blue-400" />
          }
        </div>
        
        {expandedSections.analysis && (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="rounded-lg border border-[var(--border-muted)] bg-[var(--surface-strong)] p-4">
                <h3 className="text-lg font-medium text-blue-300">Activity Stats</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Active Days:</span>
                    <span className="font-medium text-[var(--text-primary)]">{analysis.summary.activeDays}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Activity Rate:</span>
                    <span className="font-medium text-[var(--text-primary)]">{(parseFloat(analysis.summary.activityRate) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Total Submissions:</span>
                    <span className="font-medium text-[var(--text-primary)]">{submissionHeatmap.totalSubmissions}</span>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg border border-[var(--border-muted)] bg-[var(--surface-strong)] p-4">
                <h3 className="text-lg font-medium text-blue-300">Contest Performance</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Contests:</span>
                    <span className="font-medium text-[var(--text-primary)]">{analysis.summary.contestsParticipated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Highest Rating:</span>
                    <span className="font-medium text-[var(--text-primary)]">{analysis.summary.highestRating}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Best Rank:</span>
                    <span className="font-medium text-[var(--text-primary)]">{analysis.summary.bestRank}</span>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg border border-[var(--border-muted)] bg-[var(--surface-strong)] p-4">
                <h3 className="text-lg font-medium text-blue-300">Progress</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Rating Trend:</span>
                    <span className="font-medium text-green-400 flex items-center">
                      +{analysis.summary.ratingTrend} <TrendingUp size={16} className="ml-1" />
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Current Rating:</span>
                    <span className="font-medium text-[var(--text-primary)]">{profileInfo.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contest Performance Graph */}
      <div className="overflow-hidden rounded-lg border border-[var(--border-muted)] bg-[var(--surface)] text-[var(--text-primary)] shadow-lg">
        <div 
          className="flex cursor-pointer items-center justify-between border-b border-[var(--border-muted)] bg-[var(--surface-muted)] p-4"
          onClick={() => toggleSection('contest')}
        >
          <h2 className="text-xl font-semibold flex items-center">
            <Star className="mr-2 text-blue-400" /> Contest Performance
          </h2>
          {expandedSections.contest ? 
            <ChevronUp className="text-blue-400" /> : 
            <ChevronDown className="text-blue-400" />
          }
        </div>
        
        {expandedSections.contest && (
          <div className="p-4">
            <div className="mb-4 flex flex-wrap gap-3">
              <div className="rounded-full border border-[var(--border-muted)] bg-[var(--surface-strong)] px-3 py-1 text-sm text-[var(--text-primary)]">
                Contests: {contestGraph.contestsParticipated}
              </div>
              <div className="rounded-full border border-[var(--border-muted)] bg-[var(--surface-strong)] px-3 py-1 text-sm text-[var(--text-primary)]">
                Highest Rating: {contestGraph.highestRating}
              </div>
              <div className="rounded-full border border-[var(--border-muted)] bg-[var(--surface-strong)] px-3 py-1 text-sm text-[var(--text-primary)]">
                Best Rank: {contestGraph.bestRank}
              </div>
            </div>
            
            <div className="h-64 w-full rounded-lg border border-[var(--border-muted)] bg-[var(--surface-strong)] p-4 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" opacity={0.4} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: 'var(--text-muted)' }} 
                    angle={-45} 
                    textAnchor="end"
                    height={60}
                    stroke="var(--border-muted)"
                  />
                  <YAxis 
                    domain={['dataMin - 100', 'dataMax + 100']} 
                    tick={{ fill: 'var(--text-muted)' }}
                    stroke="var(--border-muted)"
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}`, 'Rating']}
                    labelFormatter={(label, items) => {
                      const item = items[0]?.payload;
                      return `${label} (${item?.date})`;
                    }}
                    contentStyle={{ 
                      backgroundColor: 'var(--surface-strong)', 
                      border: '1px solid var(--border-muted)', 
                      color: 'var(--text-primary)', 
                      borderRadius: '0.375rem' 
                    }}
                  />
                  <Legend wrapperStyle={{ color: 'var(--text-muted)' }} />
                  <Line 
                    type="monotone" 
                    dataKey="rating" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#1d4ed8' }}
                    activeDot={{ r: 6, fill: '#93c5fd' }}
                    animationDuration={1000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Recent Contests Table */}
      <div className="overflow-hidden rounded-lg border border-[var(--border-muted)] bg-[var(--surface)] text-[var(--text-primary)] shadow-lg">
        <div className="border-b border-[var(--border-muted)] bg-[var(--surface-muted)] p-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Code className="mr-2 text-blue-400" /> Recent Contests
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-[var(--surface)]">
            <thead className="bg-[var(--surface-muted)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Contest</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Rating</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Rank</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-muted)]">
              {contestGraph.contestHistory.slice(0, 5).map((contest, index) => (
                <tr 
                  key={index} 
                  className="transition-colors duration-150 hover:bg-[var(--surface-muted)]"
                >
                  <td className="py-3 px-4 text-sm">{contest.contestName}</td>
                  <td className="px-4 py-3 text-sm text-[var(--text-muted)]">{contest.date}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-900/50 text-blue-100 border border-blue-700/50">
                      {contest.rating}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-muted)]">#{contest.rank}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CodeChefStats;
