const supabase = require('../supabase/supabaseClient');

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error) {
      throw new Error(error.message || 'Invalid token');
    }

    if (!user) {
      throw new Error('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401).json({ error: error.message });
  }
};

module.exports = authMiddleware;
