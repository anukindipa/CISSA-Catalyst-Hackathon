import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Container, Title, Button, Card, Badge } from '../styles/GlobalStyle';
import { supabase } from '../lib/supabase';

const LeaderboardContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  padding: 2rem 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
`;

const LeaderboardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const LeaderboardCard = styled(Card)`
  h3 {
    color: ${props => props.theme.colors.primary};
    margin-bottom: 1.5rem;
    text-align: center;
  }
`;

const LeaderboardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const LeaderboardItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: ${props => props.rank <= 3 ? props.theme.colors.surface : props.theme.colors.surfaceLight};
  border-radius: ${props => props.theme.borderRadius.medium};
  border: ${props => props.rank <= 3 ? `2px solid ${props.theme.colors.primary}` : '1px solid transparent'};
  position: relative;
  transition: ${props => props.theme.transitions.medium};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.glow};
  }

  ${props => props.isCurrentUser && `
    border-color: ${props.theme.colors.primary};
    box-shadow: ${props.theme.shadows.glow};
  `}
`;

const RankBadge = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
  background: ${props => {
    if (props.rank === 1) return '#FFD700'; // Gold
    if (props.rank === 2) return '#C0C0C0'; // Silver
    if (props.rank === 3) return '#CD7F32'; // Bronze
    return props.theme.colors.primary;
  }};
  color: ${props => props.rank <= 3 ? '#000' : 'white'};
  box-shadow: ${props => props.rank <= 3 ? props.theme.shadows.glow : 'none'};
`;

const UserInfo = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  background: ${props => props.theme.gradients.primary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1rem;
  box-shadow: ${props => props.theme.shadows.glow};
`;

const UserDetails = styled.div`
  h4 {
    color: ${props => props.theme.colors.text};
    margin-bottom: 0.25rem;
  }
  p {
    color: ${props => props.theme.colors.textSecondary};
    font-size: 0.9rem;
  }
`;

const ScoreDisplay = styled.div`
  text-align: right;
  h4 {
    color: ${props => props.theme.colors.primary};
    font-size: 1.2rem;
    margin-bottom: 0.25rem;
  }
  p {
    color: ${props => props.theme.colors.textSecondary};
    font-size: 0.8rem;
  }
`;

const BadgesSection = styled.div`
  margin-top: 3rem;
`;

const BadgesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const BadgeCard = styled(Card)`
  text-align: center;
  padding: 1.5rem;
  transition: ${props => props.theme.transitions.medium};

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.glow};
  }
`;

const BadgeIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const BadgeTitle = styled.h4`
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const BadgeDescription = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const StatCard = styled(Card)`
  text-align: center;
  padding: 1.5rem;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 3px solid ${props => props.theme.colors.border};
  border-top: 3px solid ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Leaderboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    if (user) {
      fetchUserProgress();
    }
  }, [user]);

  const fetchLeaderboard = async () => {
    try {
      // Try Supabase first
      const { data: leaderboardData, error } = await supabase
        .from('leaderboard_scores')
        .select(`
          *,
          users!inner(username, avatar)
        `)
        .order('total_score', { ascending: false })
        .limit(10);

      if (error) {
        console.log('Supabase not available, using localStorage fallback for leaderboard');
        fetchLeaderboardLocalStorage();
        return;
      }

      // Transform the data to match the expected format
      const transformedLeaderboard = leaderboardData.map(entry => ({
        userId: entry.user_id,
        username: entry.users.username,
        score: entry.total_score,
        avatar: entry.users.avatar
      }));

      setLeaderboard(transformedLeaderboard);

    } catch (error) {
      console.log('Supabase error, using localStorage fallback for leaderboard');
      fetchLeaderboardLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboardLocalStorage = () => {
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
      
      // Sort by score and limit to 10
      const sortedLeaderboard = leaderboard
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      
      setLeaderboard(sortedLeaderboard);
      console.log('Leaderboard loaded from localStorage:', sortedLeaderboard);

    } catch (error) {
      console.error('Error fetching leaderboard from localStorage:', error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    try {
      // Try Supabase first
      const { data: leaderboardScore, error: scoreError } = await supabase
        .from('leaderboard_scores')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (scoreError && scoreError.code !== 'PGRST116') {
        console.log('Supabase not available, using localStorage fallback for user progress');
        fetchUserProgressLocalStorage();
        return;
      }

      // Fetch user's question attempts
      const { data: attempts, error: attemptsError } = await supabase
        .from('question_attempts')
        .select('*')
        .eq('user_id', user.id);

      if (attemptsError) {
        console.log('Supabase not available, using localStorage fallback for user progress');
        fetchUserProgressLocalStorage();
        return;
      }

      // Fetch user's statistics for badges
      const { data: userStats, error: statsError } = await supabase
        .from('user_statistics')
        .select('badges')
        .eq('user_id', user.id)
        .single();

      if (statsError && statsError.code !== 'PGRST116') {
        console.log('Supabase not available, using localStorage fallback for user progress');
        fetchUserProgressLocalStorage();
        return;
      }

      setUserProgress({
        attempts: attempts || [],
        totalScore: leaderboardScore?.total_score || 0,
        badges: userStats?.badges || [],
        streak: leaderboardScore?.current_streak || 0
      });

    } catch (error) {
      console.log('Supabase error, using localStorage fallback for user progress');
      fetchUserProgressLocalStorage();
    }
  };

  const fetchUserProgressLocalStorage = () => {
    try {
      // Get user's leaderboard score from localStorage
      const leaderboardScore = JSON.parse(localStorage.getItem(`leaderboard_scores_${user.id}`) || '{}');
      
      // Get user's question attempts from localStorage
      const attempts = JSON.parse(localStorage.getItem(`question_attempts_${user.id}`) || '[]');
      
      // Get user's statistics for badges from localStorage
      const userStats = JSON.parse(localStorage.getItem(`user_statistics_${user.id}`) || '{}');
      
      setUserProgress({
        attempts: attempts || [],
        totalScore: leaderboardScore?.total_score || 0,
        badges: userStats?.badges || [],
        streak: leaderboardScore?.current_streak || 0
      });

      console.log('User progress loaded from localStorage:', {
        totalScore: leaderboardScore?.total_score || 0,
        attempts: attempts.length,
        badges: userStats?.badges || [],
        streak: leaderboardScore?.current_streak || 0
      });

    } catch (error) {
      console.error('Error fetching user progress from localStorage:', error);
      setUserProgress({
        attempts: [],
        totalScore: 0,
        badges: [],
        streak: 0
      });
    }
  };

  const getInitials = (username) => {
    return username ? username.charAt(0).toUpperCase() : 'U';
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  const badges = [
    {
      id: 'law_expert',
      name: 'Courtroom Ace',
      icon: '⚖️',
      description: 'Achieve an A grade in a Law scenario',
      unlocked: userProgress?.badges?.includes('law_expert') || false
    },
    {
      id: 'biomed_expert',
      name: 'Master Diagnoser',
      icon: '🏥',
      description: 'Achieve an A grade in a Biomedical scenario',
      unlocked: userProgress?.badges?.includes('biomed_expert') || false
    },
    {
      id: 'finance_expert',
      name: 'Market Wizard',
      icon: '💰',
      description: 'Achieve an A grade in a Finance scenario',
      unlocked: userProgress?.badges?.includes('finance_expert') || false
    },
    {
      id: 'high_scorer',
      name: 'High Scorer',
      icon: '🎯',
      description: 'Score 30+ points in any scenario',
      unlocked: userProgress?.badges?.includes('high_scorer') || false
    },
    {
      id: 'streak_master',
      name: 'Streak Master',
      icon: '🔥',
      description: 'Complete 10 scenarios in a row',
      unlocked: userProgress?.badges?.includes('streak_master') || false
    },
    {
      id: 'perfectionist',
      name: 'Perfectionist',
      icon: '💎',
      description: 'Achieve perfect scores in 5 scenarios',
      unlocked: userProgress?.badges?.includes('perfectionist') || false
    }
  ];

  if (loading) {
    return (
      <LeaderboardContainer>
        <Container>
          <LoadingContainer>
            <LoadingSpinner />
          </LoadingContainer>
        </Container>
      </LeaderboardContainer>
    );
  }

  return (
    <LeaderboardContainer>
      <Container>
        <Header>
          <div>
            <Title>Leaderboard</Title>
            <p style={{ color: '#B0B0B0', fontSize: '1.1rem' }}>
              Compete with other students and track your progress
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </Header>

        <LeaderboardGrid>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <LeaderboardCard>
              <h3>🏆 Top Performers</h3>
              <LeaderboardList>
                {leaderboard.slice(0, 5).map((entry, index) => (
                  <motion.div
                    key={entry.userId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <LeaderboardItem
                      rank={index + 1}
                      isCurrentUser={user && entry.userId === user.id}
                    >
                      <RankBadge rank={index + 1}>
                        {getRankIcon(index + 1)}
                      </RankBadge>
                      <UserInfo>
                        <UserAvatar>{getInitials(entry.username)}</UserAvatar>
                        <UserDetails>
                          <h4>{entry.username}</h4>
                          <p>Total Score</p>
                        </UserDetails>
                      </UserInfo>
                      <ScoreDisplay>
                        <h4>{entry.score}</h4>
                        <p>points</p>
                      </ScoreDisplay>
                    </LeaderboardItem>
                  </motion.div>
                ))}
              </LeaderboardList>
            </LeaderboardCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <LeaderboardCard>
              <h3>📊 Your Progress</h3>
              {userProgress ? (
                <>
                  <StatsGrid>
                    <StatCard>
                      <StatNumber>{userProgress.totalScore}</StatNumber>
                      <StatLabel>Total Score</StatLabel>
                    </StatCard>
                    <StatCard>
                      <StatNumber>{userProgress.badges?.length || 0}</StatNumber>
                      <StatLabel>Badges Earned</StatLabel>
                    </StatCard>
                    <StatCard>
                      <StatNumber>{userProgress.streak || 0}</StatNumber>
                      <StatLabel>Current Streak</StatLabel>
                    </StatCard>
                    <StatCard>
                      <StatNumber>{userProgress.attempts?.length || 0}</StatNumber>
                      <StatLabel>Scenarios Completed</StatLabel>
                    </StatCard>
                  </StatsGrid>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#B0B0B0' }}>
                  <p>Complete scenarios to see your progress!</p>
                </div>
              )}
            </LeaderboardCard>
          </motion.div>
        </LeaderboardGrid>

        <BadgesSection>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Title style={{ fontSize: '2rem', marginBottom: '1rem' }}>Achievement Badges</Title>
            <p style={{ color: '#B0B0B0', textAlign: 'center', marginBottom: '2rem' }}>
              Unlock badges by completing scenarios and achieving high scores
            </p>

            <BadgesGrid>
              {badges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                >
                  <BadgeCard style={{ 
                    opacity: badge.unlocked ? 1 : 0.5,
                    border: badge.unlocked ? `2px solid ${badge.unlocked ? '#8B5CF6' : '#333'}` : '1px solid #333'
                  }}>
                    <BadgeIcon>{badge.icon}</BadgeIcon>
                    <BadgeTitle>{badge.name}</BadgeTitle>
                    <BadgeDescription>{badge.description}</BadgeDescription>
                    {badge.unlocked && (
                      <Badge style={{ marginTop: '1rem' }}>Unlocked!</Badge>
                    )}
                  </BadgeCard>
                </motion.div>
              ))}
            </BadgesGrid>
          </motion.div>
        </BadgesSection>
      </Container>
    </LeaderboardContainer>
  );
};

export default Leaderboard;
