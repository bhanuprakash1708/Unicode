const codechefService = require("../services/codechefService");
const axios = require('axios');
const codechefController = {
  
  async getProfileData(req, res) {
    try {
      const { username } = req.params;
      if (!username) {
        return res.status(400).json({ error: "Username is required" });
      }
      const profileData = await codechefService.extractProfileData(username);
      return res.status(200).json(profileData);
    } catch (error) {
      console.error("Error in getProfileData:", error);
      return res
        .status(500)
        .json({ error: error.message || "Failed to extract profile data" });
    }
  },

  async getAnalysis(req, res) {
    try {
      const { username } = req.params;

      if (!username) {
        return res.status(400).json({ error: "Username is required" });
      }

      // Fetch all data in parallel - use allSettled so partial data can be returned
      const [profileResult, heatmapResult, contestResult] = await Promise.allSettled([
        codechefService.extractProfileData(username),
        codechefService.extractSubmissionHeatmap(username).catch(() => ({ activeDays: 0, totalSubmissions: 0, heatmapData: [] })),
        codechefService.extractContestGraph(username).catch(() => ({ contestsParticipated: 0, highestRating: 0, bestRank: 0, contestHistory: [] })),
      ]);

      // Profile data is required - if it fails, return 404
      if (profileResult.status === "rejected" || !profileResult.value) {
        const errMsg = profileResult.reason?.message || "User not found or CodeChef is temporarily unavailable";
        if (errMsg.toLowerCase().includes("404") || errMsg.toLowerCase().includes("not found")) {
          return res.status(404).json({ error: "User not found on CodeChef" });
        }
        return res.status(500).json({ error: errMsg });
      }

      const profileData = profileResult.value;
      const heatmapData = heatmapResult.status === "fulfilled" ? heatmapResult.value : { activeDays: 0, totalSubmissions: 0, heatmapData: [] };
      const contestData = contestResult.status === "fulfilled" ? contestResult.value : { contestsParticipated: 0, highestRating: 0, bestRank: 0, contestHistory: [] };

      // Build analysis from available data
      const totalProblemsSolved = profileData.problemsSolved || 0;
      const activityRate = (heatmapData.activeDays || 0) / 365;
      const contestHistory = contestData.contestHistory || [];
      let ratingTrend = 0;
      if (contestHistory.length >= 2) {
        ratingTrend = contestHistory[contestHistory.length - 1].rating - contestHistory[0].rating;
      }

      const analysisData = {
        username,
        summary: {
          totalProblemsSolved,
          activeDays: heatmapData.activeDays || 0,
          activityRate: activityRate.toFixed(2),
          contestsParticipated: contestData.contestsParticipated || 0,
          highestRating: contestData.highestRating || 0,
          bestRank: contestData.bestRank === Infinity ? 0 : (contestData.bestRank || 0),
          ratingTrend,
        },
        strengths: {
          strongestCategory: "General",
          problemsSolvedInCategory: totalProblemsSolved,
        },
      };

      const completeAnalysis = {
        profileInfo: profileData,
        analysis: analysisData,
        submissionHeatmap: heatmapData,
        contestGraph: contestData,
      };

      return res.status(200).json(completeAnalysis);
    } catch (error) {
      console.error("Error in getAnalysis:", error);
      return res
        .status(500)
        .json({ error: error.message || "Failed to analyze profile" });
    }
  },

  async getSubmissionHeatmap(req, res) {
    try {
      const { username } = req.params;

      if (!username) {
        return res.status(400).json({ error: "Username is required" });
      }

      const heatmapData = await codechefService.extractSubmissionHeatmap(
        username
      );
      return res.status(200).json(heatmapData);
    } catch (error) {
      console.error("Error in getSubmissionHeatmap:", error);
      return res
        .status(500)
        .json({
          error: error.message || "Failed to extract submission heatmap",
        });
    }
  },

  async getContestGraph(req, res) {
    try {
      const { username } = req.params;

      if (!username) {
        return res.status(400).json({ error: "Username is required" });
      }

      const contestData = await codechefService.extractContestGraph(username);
      return res.status(200).json(contestData);
    } catch (error) {
      console.error("Error in getContestGraph:", error);
      return res
        .status(500)
        .json({ error: error.message || "Failed to extract contest graph" });
    }
  },
  async getTotalProblemsSolved(username) {
    const apiUrl = `https://codechef-api.vercel.app/${username}`;
    const response = await axios.get(apiUrl);
    return response.data.fullySolved || 0; // Check the actual API response structure
  },
};

module.exports = codechefController;
