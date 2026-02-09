const DashboardService = require('../services/dashboardService');

class DashboardController {
  static async updateContestRankingInfo(req, res) {
    try {
      const userId = req.user.id;
      const contestData = req.body;
      if (!contestData || typeof contestData !== 'object') {
        return res.status(400).json({ error: 'Invalid request body' });
      }
      const result = await DashboardService.upsertContestRankingInfo(userId, contestData);
      res.status(200).json(result);
    } catch (error) {
      console.error('updateContestRankingInfo error:', error);
      const isSchemaError = error.message?.includes('column') || error.message?.includes('does not exist');
      const status = isSchemaError ? 500 : 400;
      const message = isSchemaError
        ? 'Database schema mismatch. Run the migration SQL in SETUP.md to add required columns.'
        : error.message;
      res.status(status).json({ error: message });
    }
  }

  static async updateTotalQuestions(req, res) {
    try {
      const userId = req.user.id;
      const questionsData = req.body;
      if (!questionsData || typeof questionsData !== 'object') {
        return res.status(400).json({ error: 'Invalid request body' });
      }
      const result = await DashboardService.upsertTotalQuestions(userId, questionsData);
      res.status(200).json(result);
    } catch (error) {
      console.error('updateTotalQuestions error:', error);
      const isSchemaError = error.message?.includes('column') || error.message?.includes('does not exist');
      const status = isSchemaError ? 500 : 400;
      const message = isSchemaError
        ? 'Database schema mismatch. Run the migration SQL in SETUP.md to add required columns.'
        : error.message;
      res.status(status).json({ error: message });
    }
  }

  static async getDashboardData(req, res) {
    try {
      const userId = req.user.id;
      const result = await DashboardService.getDashboardData(userId);
      res.status(200).json(result);
    } catch (error) {
      console.error('getDashboardData error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = DashboardController;