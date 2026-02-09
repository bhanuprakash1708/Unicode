const supabase = require('../supabase/supabaseClient');

class DashboardService {
  // Contest Ranking Info Methods
  static async upsertContestRankingInfo(userId, contestData) {
    // Ensure rating fields are integers (DB columns are INTEGER type - reject decimals like 1788.66)
    const sanitized = { ...contestData };
    const ratingFields = ['leetcode_recent_contest_rating', 'leetcode_max_contest_rating', 'codeforces_recent_contest_rating', 'codeforces_max_contest_rating', 'codechef_recent_contest_rating', 'codechef_max_contest_rating', 'codechef_stars'];
    ratingFields.forEach(field => {
      if (sanitized[field] != null) {
        const num = typeof sanitized[field] === 'number' ? sanitized[field] : parseFloat(sanitized[field]);
        if (!isNaN(num) && !Number.isInteger(num)) {
          sanitized[field] = Math.round(num);
        }
      }
    });

    const { data, error } = await supabase
      .from('contest_ranking_info')
      .upsert({
        id: userId,
        ...sanitized,
        updated_at: new Date()
      })
      .select('*');
    
    if (error) throw new Error(error.message);
    return data;
  }

  static async getContestRankingInfo(userId) {
    const { data, error } = await supabase
      .from('contest_ranking_info')
      .select('*')
      .eq('id', userId);
    
    if (error) throw new Error(error.message);
    return data;
  }

  // Total Questions Methods
  static async upsertTotalQuestions(userId, questionsData) {
    const { data, error } = await supabase
      .from('total_questions')
      .upsert({
        id: userId,
        ...questionsData,
        updated_at: new Date()
      })
      .select('*');
    
    if (error) throw new Error(error.message);
    return data;
  }

  static async getTotalQuestions(userId) {
    const { data, error } = await supabase
      .from('total_questions')
      .select('*')
      .eq('id', userId);
    
    if (error) throw new Error(error.message);
    return data;
  }

  // Combined Dashboard Data
  static async getDashboardData(userId) {
    const [contestData, questionsData] = await Promise.all([
      this.getContestRankingInfo(userId),
      this.getTotalQuestions(userId)
    ]);
    
    return {
      contest_ranking_info: contestData,
      total_questions: questionsData
    };
  }
}

module.exports = DashboardService;