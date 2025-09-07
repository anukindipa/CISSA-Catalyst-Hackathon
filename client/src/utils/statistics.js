import { supabase } from '../lib/supabase';

/**
 * Record a question attempt in the database
 * @param {string} userId - The user's ID
 * @param {string} questionId - The question ID
 * @param {string} subject - The subject (e.g., 'finance', 'law', 'biomed')
 * @param {string} difficulty - The difficulty level ('easy', 'medium', 'hard')
 * @param {string} userAnswer - The user's answer
 * @param {boolean} isCorrect - Whether the answer was correct
 * @param {number} timeSpent - Time spent in seconds
 * @param {number} hintsUsed - Number of hints used
 */
export const recordQuestionAttempt = async (userId, questionId, subject, difficulty, userAnswer, isCorrect, timeSpent = 0, hintsUsed = 0) => {
  try {
    // Try Supabase first
    const { error: attemptError } = await supabase
      .from('question_attempts')
      .insert({
        user_id: userId,
        question_id: questionId,
        subject: subject,
        difficulty: difficulty,
        user_answer: userAnswer,
        is_correct: isCorrect,
        time_spent: timeSpent,
        hints_used: hintsUsed
      });

    if (attemptError) {
      console.log('Supabase not available, using localStorage fallback:', attemptError.message);
      // Fallback to localStorage
      return recordQuestionAttemptLocalStorage(userId, questionId, subject, difficulty, userAnswer, isCorrect, timeSpent, hintsUsed);
    }

    // Update daily stats
    await updateDailyStats(userId, difficulty, isCorrect, timeSpent, hintsUsed);

    // Update leaderboard scores
    await updateLeaderboardScores(userId, isCorrect, difficulty);

    // Update user statistics
    await updateUserStatistics(userId, isCorrect, difficulty);

    return true;
  } catch (error) {
    console.log('Supabase error, using localStorage fallback:', error.message);
    // Fallback to localStorage
    return recordQuestionAttemptLocalStorage(userId, questionId, subject, difficulty, userAnswer, isCorrect, timeSpent, hintsUsed);
  }
};

// Fallback function using localStorage
const recordQuestionAttemptLocalStorage = (userId, questionId, subject, difficulty, userAnswer, isCorrect, timeSpent = 0, hintsUsed = 0) => {
  try {
    // Get existing attempts
    const attempts = JSON.parse(localStorage.getItem(`question_attempts_${userId}`) || '[]');
    
    // Add new attempt
    const newAttempt = {
      id: Date.now().toString(),
      question_id: questionId,
      subject: subject,
      difficulty: difficulty,
      user_answer: userAnswer,
      is_correct: isCorrect,
      time_spent: timeSpent,
      hints_used: hintsUsed,
      attempted_at: new Date().toISOString()
    };
    
    attempts.push(newAttempt);
    localStorage.setItem(`question_attempts_${userId}`, JSON.stringify(attempts));
    
    // Update daily stats
    updateDailyStatsLocalStorage(userId, difficulty, isCorrect, timeSpent, hintsUsed);
    
    // Update leaderboard scores
    updateLeaderboardScoresLocalStorage(userId, isCorrect, difficulty);
    
    // Update user statistics
    updateUserStatisticsLocalStorage(userId, isCorrect, difficulty);
    
    console.log('Question attempt recorded in localStorage:', {
      userId,
      questionId,
      subject,
      difficulty,
      isCorrect,
      timeSpent,
      hintsUsed
    });
    return true;
  } catch (error) {
    console.error('Error recording question attempt in localStorage:', error);
    return false;
  }
};

/**
 * Update daily statistics for a user
 */
const updateDailyStats = async (userId, difficulty, isCorrect, timeSpent, hintsUsed) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get existing daily stats for today
    const { data: existingStats, error: fetchError } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching daily stats:', fetchError);
      return;
    }

    const updateData = {
      user_id: userId,
      date: today,
      questions_answered: (existingStats?.questions_answered || 0) + 1,
      correct_answers: (existingStats?.correct_answers || 0) + (isCorrect ? 1 : 0),
      time_spent: (existingStats?.time_spent || 0) + timeSpent,
      hints_used: (existingStats?.hints_used || 0) + hintsUsed,
      easy_questions: (existingStats?.easy_questions || 0) + (difficulty === 'easy' ? 1 : 0),
      medium_questions: (existingStats?.medium_questions || 0) + (difficulty === 'medium' ? 1 : 0),
      hard_questions: (existingStats?.hard_questions || 0) + (difficulty === 'hard' ? 1 : 0)
    };

    if (existingStats) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('daily_stats')
        .update(updateData)
        .eq('id', existingStats.id);

      if (updateError) {
        console.error('Error updating daily stats:', updateError);
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('daily_stats')
        .insert(updateData);

      if (insertError) {
        console.error('Error inserting daily stats:', insertError);
      }
    }
  } catch (error) {
    console.error('Error in updateDailyStats:', error);
  }
};

/**
 * Update leaderboard scores for a user
 */
const updateLeaderboardScores = async (userId, isCorrect, difficulty) => {
  try {
    // Get existing leaderboard score
    const { data: existingScore, error: fetchError } = await supabase
      .from('leaderboard_scores')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching leaderboard score:', fetchError);
      return;
    }

    // Calculate points based on difficulty
    let points = 0;
    if (isCorrect) {
      const difficultyLower = difficulty.toLowerCase();
      if (difficultyLower === 'easy') points = 10;
      else if (difficultyLower === 'medium') points = 20;
      else if (difficultyLower === 'hard') points = 30;
    }

    const updateData = {
      user_id: userId,
      total_score: (existingScore?.total_score || 0) + points,
      total_questions: (existingScore?.total_questions || 0) + 1,
      correct_answers: (existingScore?.correct_answers || 0) + (isCorrect ? 1 : 0),
      current_streak: isCorrect ? (existingScore?.current_streak || 0) + 1 : 0,
      longest_streak: Math.max(
        existingScore?.longest_streak || 0,
        isCorrect ? (existingScore?.current_streak || 0) + 1 : existingScore?.longest_streak || 0
      ),
      last_activity: new Date().toISOString()
    };

    if (existingScore) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('leaderboard_scores')
        .update(updateData)
        .eq('id', existingScore.id);

      if (updateError) {
        console.error('Error updating leaderboard score:', updateError);
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('leaderboard_scores')
        .insert(updateData);

      if (insertError) {
        console.error('Error inserting leaderboard score:', insertError);
      }
    }
  } catch (error) {
    console.error('Error in updateLeaderboardScores:', error);
  }
};

/**
 * Update user statistics
 */
const updateUserStatistics = async (userId, isCorrect, difficulty) => {
  try {
    // Get existing user statistics
    const { data: existingStats, error: fetchError } = await supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user statistics:', fetchError);
      return;
    }

    // Calculate XP based on difficulty
    let xp = 0;
    if (isCorrect) {
      const difficultyLower = difficulty.toLowerCase();
      if (difficultyLower === 'easy') xp = 10;
      else if (difficultyLower === 'medium') xp = 20;
      else if (difficultyLower === 'hard') xp = 30;
    }

    const updateData = {
      user_id: userId,
      total_questions_answered: (existingStats?.total_questions_answered || 0) + 1,
      total_correct_answers: (existingStats?.total_correct_answers || 0) + (isCorrect ? 1 : 0),
      current_streak: isCorrect ? (existingStats?.current_streak || 0) + 1 : 0,
      longest_streak: Math.max(
        existingStats?.longest_streak || 0,
        isCorrect ? (existingStats?.current_streak || 0) + 1 : existingStats?.longest_streak || 0
      ),
      xp_total: (existingStats?.xp_total || 0) + xp,
      last_updated: new Date().toISOString()
    };

    if (existingStats) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('user_statistics')
        .update(updateData)
        .eq('id', existingStats.id);

      if (updateError) {
        console.error('Error updating user statistics:', updateError);
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('user_statistics')
        .insert(updateData);

      if (insertError) {
        console.error('Error inserting user statistics:', insertError);
      }
    }
  } catch (error) {
    console.error('Error in updateUserStatistics:', error);
  }
};

/**
 * Get user's current statistics
 */
export const getUserStatistics = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user statistics:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserStatistics:', error);
    return null;
  }
};

/**
 * Get leaderboard data
 */
export const getLeaderboard = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('leaderboard_scores')
      .select(`
        *,
        users!inner(username, avatar)
      `)
      .order('total_score', { ascending: false })
      .limit(limit);

    if (error) {
      console.log('Supabase not available, using localStorage fallback for leaderboard');
      return getLeaderboardLocalStorage(limit);
    }

    return data.map(entry => ({
      userId: entry.user_id,
      username: entry.users.username,
      score: entry.total_score,
      avatar: entry.users.avatar
    }));
  } catch (error) {
    console.log('Supabase error, using localStorage fallback for leaderboard');
    return getLeaderboardLocalStorage(limit);
  }
};

// localStorage fallback functions
const updateDailyStatsLocalStorage = (userId, difficulty, isCorrect, timeSpent, hintsUsed) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const dailyStats = JSON.parse(localStorage.getItem(`daily_stats_${userId}`) || '{}');
    
    if (!dailyStats[today]) {
      dailyStats[today] = {
        questions_answered: 0,
        correct_answers: 0,
        time_spent: 0,
        hints_used: 0,
        easy_questions: 0,
        medium_questions: 0,
        hard_questions: 0
      };
    }
    
    dailyStats[today].questions_answered += 1;
    dailyStats[today].correct_answers += isCorrect ? 1 : 0;
    dailyStats[today].time_spent += timeSpent;
    dailyStats[today].hints_used += hintsUsed;
    
    const difficultyLower = difficulty.toLowerCase();
    if (difficultyLower === 'easy') dailyStats[today].easy_questions += 1;
    else if (difficultyLower === 'medium') dailyStats[today].medium_questions += 1;
    else if (difficultyLower === 'hard') dailyStats[today].hard_questions += 1;
    
    localStorage.setItem(`daily_stats_${userId}`, JSON.stringify(dailyStats));
    console.log('Daily stats updated:', {
      userId,
      today,
      difficulty,
      isCorrect,
      dailyStats: dailyStats[today]
    });
  } catch (error) {
    console.error('Error updating daily stats in localStorage:', error);
  }
};

const updateLeaderboardScoresLocalStorage = (userId, isCorrect, difficulty) => {
  try {
    const leaderboardScores = JSON.parse(localStorage.getItem(`leaderboard_scores_${userId}`) || '{}');
    
    // Calculate points based on difficulty
    let points = 0;
    if (isCorrect) {
      const difficultyLower = difficulty.toLowerCase();
      if (difficultyLower === 'easy') points = 10;
      else if (difficultyLower === 'medium') points = 20;
      else if (difficultyLower === 'hard') points = 30;
    }
    
    leaderboardScores.total_score = (leaderboardScores.total_score || 0) + points;
    leaderboardScores.total_questions = (leaderboardScores.total_questions || 0) + 1;
    leaderboardScores.correct_answers = (leaderboardScores.correct_answers || 0) + (isCorrect ? 1 : 0);
    leaderboardScores.current_streak = isCorrect ? (leaderboardScores.current_streak || 0) + 1 : 0;
    leaderboardScores.longest_streak = Math.max(
      leaderboardScores.longest_streak || 0,
      isCorrect ? (leaderboardScores.current_streak || 0) + 1 : leaderboardScores.longest_streak || 0
    );
    leaderboardScores.last_activity = new Date().toISOString();
    
    localStorage.setItem(`leaderboard_scores_${userId}`, JSON.stringify(leaderboardScores));
    console.log('Leaderboard scores updated:', {
      userId,
      difficulty,
      isCorrect,
      points,
      totalScore: leaderboardScores.total_score
    });
  } catch (error) {
    console.error('Error updating leaderboard scores in localStorage:', error);
  }
};

const updateUserStatisticsLocalStorage = (userId, isCorrect, difficulty) => {
  try {
    const userStats = JSON.parse(localStorage.getItem(`user_statistics_${userId}`) || '{}');
    
    // Calculate XP based on difficulty
    let xp = 0;
    if (isCorrect) {
      const difficultyLower = difficulty.toLowerCase();
      if (difficultyLower === 'easy') xp = 10;
      else if (difficultyLower === 'medium') xp = 20;
      else if (difficultyLower === 'hard') xp = 30;
    }
    
    userStats.total_questions_answered = (userStats.total_questions_answered || 0) + 1;
    userStats.total_correct_answers = (userStats.total_correct_answers || 0) + (isCorrect ? 1 : 0);
    userStats.current_streak = isCorrect ? (userStats.current_streak || 0) + 1 : 0;
    userStats.longest_streak = Math.max(
      userStats.longest_streak || 0,
      isCorrect ? (userStats.current_streak || 0) + 1 : userStats.longest_streak || 0
    );
    userStats.xp_total = (userStats.xp_total || 0) + xp;
    userStats.last_updated = new Date().toISOString();
    
    localStorage.setItem(`user_statistics_${userId}`, JSON.stringify(userStats));
    console.log('User statistics updated:', {
      userId,
      difficulty,
      isCorrect,
      xp,
      totalXP: userStats.xp_total
    });
  } catch (error) {
    console.error('Error updating user statistics in localStorage:', error);
  }
};

const getLeaderboardLocalStorage = (limit = 10) => {
  try {
    // Get all users from localStorage
    const users = JSON.parse(localStorage.getItem('skillsync_users') || '[]');
    const leaderboard = [];
    
    users.forEach(user => {
      const scores = JSON.parse(localStorage.getItem(`leaderboard_scores_${user.id}`) || '{}');
      if (scores.total_score > 0) {
        leaderboard.push({
          userId: user.id,
          username: user.username,
          score: scores.total_score || 0,
          avatar: user.avatar || {}
        });
      }
    });
    
    // Sort by score and limit
    return leaderboard
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting leaderboard from localStorage:', error);
    return [];
  }
};
