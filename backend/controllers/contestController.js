// controllers/contestController.js
const { getCodeforcesAllContests } = require("../services/codeforcesService");
const { getCodeChefAllContests } = require("../services/codechefService");
const leetcodeService = require("../services/leetcodeService");

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const getContestStatus = (startTime, endTime, now = Date.now()) => {
  if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) return "upcoming";
  if (now < startTime) return "upcoming";
  if (now <= endTime) return "ongoing";
  return "completed";
};

const normalizeContest = (contest, now = Date.now()) => {
  const startTime = toNumber(contest.startTime);
  const endTime = toNumber(contest.endTime);
  const safeStart = Number.isFinite(startTime) ? startTime : now;
  const safeEnd = Number.isFinite(endTime) ? endTime : safeStart;
  const durationMinutes = Math.max(0, Math.round((safeEnd - safeStart) / (1000 * 60)));

  return {
    name: contest.name || "Unnamed Contest",
    platform: contest.platform || "Unknown",
    startTime: safeStart,
    endTime: safeEnd,
    durationMinutes,
    duration: `${durationMinutes} minutes`,
    url: contest.url || "#",
    status: getContestStatus(safeStart, safeEnd, now),
  };
};

const fetchAllContests = async () => {
  const [codeforces, codechef, leetcode] = await Promise.all([
    getCodeforcesAllContests(),
    getCodeChefAllContests(),
    leetcodeService.getLeetCodeContests(),
  ]);

  const now = Date.now();
  return [...codeforces, ...codechef, ...leetcode]
    .map((contest) => normalizeContest(contest, now))
    .sort((a, b) => a.startTime - b.startTime);
};

const getAllContests = async (req, res) => {
  try {
    const allContests = await fetchAllContests();
    res.json({
      success: true,
      count: allContests.length,
      contests: allContests,
    });
  } catch (error) {
    console.error("Controller Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message || "Server error",
    });
  }
};

const getUpcomingContests = async (req, res) => {
  try {
    const allContests = await fetchAllContests();
    const upcomingContests = allContests.filter(
      (contest) => contest.status === "upcoming" || contest.status === "ongoing"
    );

    res.json({
      success: true,
      count: upcomingContests.length,
      contests: upcomingContests,
    });
  } catch (error) {
    console.error("Controller Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message || "Server error",
    });
  }
};

module.exports = { getUpcomingContests, getAllContests };
