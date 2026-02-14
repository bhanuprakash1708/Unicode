const axios = require("axios");
const cheerio = require("cheerio");

// Browser-like headers to reduce blocking by CodeChef
const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Connection": "keep-alive",
  "Upgrade-Insecure-Requests": "1",
};

// Retry helper - retries on network/5xx errors, not on 4xx
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.get(url, {
        timeout: 15000,
        headers: { ...BROWSER_HEADERS, ...options.headers },
        validateStatus: () => true,
        ...options,
      });
      if (response.status >= 500 && attempt < maxRetries) {
        lastError = Object.assign(new Error(`HTTP ${response.status}`), { response });
        await new Promise((r) => setTimeout(r, 1000 * attempt));
        continue;
      }
      if (response.status >= 400) {
        const err = new Error(`HTTP ${response.status}`);
        err.response = response;
        throw err;
      }
      return response;
    } catch (err) {
      if (err.response) throw err;
      lastError = err;
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }
  }
  throw lastError;
}

const normalizeContestDurationMs = (startTime, endTime, fallbackDurationSeconds) => {
  if (Number.isFinite(startTime) && Number.isFinite(endTime) && endTime >= startTime) {
    return endTime - startTime;
  }
  const seconds = Number(fallbackDurationSeconds);
  if (Number.isFinite(seconds) && seconds > 0) {
    return seconds * 1000;
  }
  return 0;
};

const normalizeHeatmapDate = (rawDate) => {
  if (!rawDate) return null;
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
};

const codechefService = {

  async extractProfileData(username) {
    try {
      const response = await fetchWithRetry(
        `https://www.codechef.com/users/${username}`
      );
      const $ = cheerio.load(response.data);
      
      // Basic profile info
      const rating = $(".rating-number").text().trim();
      const fullName = $(".h2-style").text().trim();
      const profileImage = $(".user-details-container img").attr("src");

      // Extract stars (from rating header)
      const ratingHeader = $(".rating-header").text().trim();
      const starsMatch = ratingHeader.match(/★+/);
      const stars = starsMatch ? starsMatch[0].length : 0;

      // Extract highest rating
      const highestRatingMatch = $(".rating-header small").text().match(/\d+/);
      const highestRating = highestRatingMatch ? parseInt(highestRatingMatch[0], 10) : 0;

      // Extract ranks
      const rankElements = $(".rating-ranks .inline-list strong");
      const globalRank = rankElements.eq(0).text().trim();
      const countryRank = rankElements.eq(1).text().trim();

      // NEW ROBUST METHOD TO GET PROBLEMS SOLVED COUNT
      let problemsSolved = 0;
      
      // Method 1: Check the problems solved section
      const solvedSection = $('h5:contains("Fully Solved")');
      if (solvedSection.length) {
        const countText = solvedSection.next().text().trim();
        const countMatch = countText.match(/\d+/);
        if (countMatch) {
          problemsSolved = parseInt(countMatch[0], 10);
        }
      }
      
      // Method 2: Fallback to searching in content (for older profiles)
      if (problemsSolved === 0) {
        const content = $('body').text();
        const solvedMatch = content.match(/Total Problems Solved:\s*(\d+)/i);
        if (solvedMatch) {
          problemsSolved = parseInt(solvedMatch[1], 10);
        }
      }

      // Method 3: Final fallback - count all solved problem links
      if (problemsSolved === 0) {
        problemsSolved = $('a[href*="/status/"]').length;
      }

      return {
        username,
        fullName,
        profileImage,
        rating,
        stars,
        highestRating,
        ranks: {
          global: globalRank,
          country: countryRank
        },
        problemsSolved
      };
    } catch (error) {
      console.error("Error extracting profile data:", error);
      if (error.response?.status === 404) {
        throw new Error("User not found on CodeChef");
      }
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        throw new Error("CodeChef took too long to respond. Please try again.");
      }
      if (error.response?.status === 403 || error.response?.status === 429) {
        throw new Error("CodeChef is temporarily limiting requests. Please try again in a few minutes.");
      }
      throw new Error("Unable to fetch profile from CodeChef. Please verify the username and try again.");
    }
  },

  async extractSubmissionHeatmap(username) {
    const parseFromProfilePage = async () => {
      try {
        const response = await fetchWithRetry(
          `https://www.codechef.com/users/${username}`
        );
        const html = response.data || "";

        const match = html.match(/var\s+userDailySubmissionsStats\s*=\s*(\[[\s\S]*?\]);/);
        if (!match || !match[1]) {
          return { activeDays: 0, totalSubmissions: 0, heatmapData: [] };
        }

        const parsed = JSON.parse(match[1]);
        if (!Array.isArray(parsed)) {
          return { activeDays: 0, totalSubmissions: 0, heatmapData: [] };
        }

        const normalized = parsed
          .map((entry) => ({
            date: normalizeHeatmapDate(entry?.date),
            count: Number.parseInt(entry?.value ?? entry?.count ?? 0, 10) || 0,
          }))
          .filter((entry) => Boolean(entry.date));

        const totalSubmissions = normalized.reduce((sum, day) => sum + day.count, 0);
        const activeDays = normalized.filter((day) => day.count > 0).length;

        return {
          activeDays,
          totalSubmissions,
          heatmapData: normalized,
        };
      } catch (error) {
        console.error("Error parsing CodeChef heatmap from profile page:", error);
        return { activeDays: 0, totalSubmissions: 0, heatmapData: [] };
      }
    };

    try {
      const apiUrl = `https://codechef-api.vercel.app/handle/${username}`;

      const response = await fetchWithRetry(apiUrl, {
        headers: { Accept: "application/json" },
      }).catch(() => null);

      if (!response?.data || !response.data.success) {
        return await parseFromProfilePage();
      }

      const heatmapData = response.data.heatMap || [];
      if (!Array.isArray(heatmapData) || heatmapData.length === 0) {
        return await parseFromProfilePage();
      }

      const activeDays = heatmapData.length;

      // Calculate total submissions
      let totalSubmissions = 0;
      heatmapData.forEach((day) => {
        totalSubmissions += parseInt(day.value || 0);
      });

      const formattedData = heatmapData
        .map((day) => ({
          date: normalizeHeatmapDate(day?.date),
          count: parseInt(day?.value || day?.count || 0, 10),
        }))
        .filter((day) => Boolean(day.date));

      if (formattedData.length === 0) {
        return await parseFromProfilePage();
      }

      // Return the formatted data
      return {
        activeDays: formattedData.filter((day) => day.count > 0).length || activeDays,
        totalSubmissions,
        heatmapData: formattedData,
      };
    } catch (error) {
      console.error("Error extracting submission heatmap:", error);
      return await parseFromProfilePage();
    }
  },

  async extractContestGraph(username) {
    try {
      const response = await fetchWithRetry(
        `https://www.codechef.com/users/${username}`
      );
      const $ = cheerio.load(response.data);

      const contestData = [];

      // Extract contest data from the rating graph
      const scripts = $("script").toArray();
      for (const script of scripts) {
        const content = $(script).html() || "";
        if (content.includes("all_rating")) {
          const match = content.match(/all_rating\s*=\s*(\[.*?\]);/s);
          if (match && match[1]) {
            try {
              const ratingData = new Function(`return ${match[1]}`)();

              // Format contest data
              contestData.push(
                ...ratingData.map((contest) => ({
                  contestCode: contest.code,
                  contestName: contest.name,
                  rating: contest.rating,
                  rank: contest.rank,
                  date: new Date(contest.end_date).toISOString().split("T")[0],
                }))
              );
            } catch (e) {
              console.error("Error parsing contest data:", e);
            }
          }
        }
      }

      // Calculate statistics
      const contestsParticipated = contestData.length;
      let highestRating = 0;
      let bestRank = Infinity;

      if (contestData.length > 0) {
        highestRating = Math.max(...contestData.map((c) => c.rating));
        bestRank = Math.min(...contestData.map((c) => c.rank));
      }

      return {
        contestsParticipated,
        highestRating,
        bestRank,
        contestHistory: contestData,
      };
    } catch (error) {
      console.error("Error extracting contest graph:", error);
      throw new Error("Failed to extract contest graph");
    }
  },

  async analyzeProfile(username) {
    try {
      // Get all the data first with proper error handling
      const [profileData, heatmapData, contestData] = await Promise.all([
        this.extractProfileData(username).catch(e => {
          console.error('Error in extractProfileData:', e);
          return { problemsSolved: 0 };
        }),
        this.extractSubmissionHeatmap(username).catch(e => {
          console.error('Error in extractSubmissionHeatmap:', e);
          return { activeDays: 0, totalSubmissions: 0, heatmapData: [] };
        }),
        this.extractContestGraph(username).catch(e => {
          console.error('Error in extractContestGraph:', e);
          return { contestsParticipated: 0, highestRating: 0, bestRank: Infinity, contestHistory: [] };
        })
      ]);

      // Safely parse problems solved
      const totalProblemsSolved = typeof profileData.problemsSolved === 'number' 
        ? profileData.problemsSolved 
        : 0;

      // Analyze activity patterns
      const activeDays = heatmapData.activeDays || 0;
      const activityRate = activeDays / 365; // Activity as percentage of the year

      // Calculate contest performance metrics
      const contestsParticipated = contestData.contestsParticipated || 0;
      let ratingTrend = 0;
      
      if (contestData.contestHistory.length >= 2) {
        ratingTrend = contestData.contestHistory[contestData.contestHistory.length - 1].rating - 
                     contestData.contestHistory[0].rating;
      }

      return {
        username: username,
        summary: {
          totalProblemsSolved,
          activeDays,
          activityRate: activityRate.toFixed(2),
          contestsParticipated,
          highestRating: contestData.highestRating || 0,
          bestRank: contestData.bestRank === Infinity ? 0 : contestData.bestRank,
          ratingTrend,
        },
        strengths: {
          strongestCategory: "General", // Default since we removed breakdown
          problemsSolvedInCategory: totalProblemsSolved // Using total as fallback
        }
      };
    } catch (error) {
      console.error("Error analyzing profile:", error);
      throw new Error("Failed to analyze profile");
    }
  },

  async getCodeChefContests() {
    try {
      const response = await axios.get(
        "https://www.codechef.com/api/list/contests/all",
        {
          headers: {
            // Some CodeChef APIs require these headers
            Accept: "application/json",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
          },
        }
      );

      const currentTime = Date.now();

      const contests = response.data.future_contests
        .filter((contest) => {
          const contestTime = new Date(contest.contest_start_date).getTime();
          return contestTime > currentTime;
        })
        .map((contest) => ({
          name: contest.contest_name,
          platform: "CodeChef",
          startTime: new Date(contest.contest_start_date).getTime(),
          endTime: new Date(contest.contest_end_date).getTime(),
          duration: `${Math.round(
            normalizeContestDurationMs(
              new Date(contest.contest_start_date).getTime(),
              new Date(contest.contest_end_date).getTime(),
              contest.contest_duration
            ) /
              (1000 * 60)
          )} minutes`,
          url: `https://www.codechef.com/${contest.contest_code}`,
        }));

      return contests;
    } catch (error) {
      console.error("CodeChef API Error:", error.message);
      throw new Error("Failed to fetch CodeChef contests");
    }
  },

  async getCodeChefAllContests() {
    try {
      const response = await axios.get("https://www.codechef.com/api/list/contests/all", {
        headers: {
          Accept: "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      const allBuckets = [
        ...(response.data.future_contests || []),
        ...(response.data.present_contests || []),
        ...(response.data.past_contests || []),
      ];

      return allBuckets
        .map((contest) => {
          const startTime = new Date(contest.contest_start_date).getTime();
          const endTimeRaw = new Date(contest.contest_end_date).getTime();
          const durationMs = normalizeContestDurationMs(
            startTime,
            endTimeRaw,
            contest.contest_duration
          );
          const endTime = Number.isFinite(endTimeRaw) && endTimeRaw >= startTime
            ? endTimeRaw
            : startTime + durationMs;

          return {
            name: contest.contest_name,
            platform: "CodeChef",
            startTime,
            endTime,
            url: `https://www.codechef.com/${contest.contest_code}`,
          };
        })
        .filter((contest) => Number.isFinite(contest.startTime) && Number.isFinite(contest.endTime));
    } catch (error) {
      console.error("CodeChef API Error:", error.message);
      throw new Error("Failed to fetch CodeChef contests");
    }
  },
};

module.exports = codechefService;
