import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const StatisticsContainer = styled.div`
  padding: 2rem;
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.large};
  border: 2px solid ${props => props.theme.colors.border};
`;

const Title = styled.h2`
  color: ${props => props.theme.colors.primary};
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: center;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.surfaceLight};
  padding: 1.5rem;
  border-radius: ${props => props.theme.borderRadius.medium};
  border: 1px solid ${props => props.theme.colors.border};
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1rem;
`;

const ChartContainer = styled.div`
  background: ${props => props.theme.colors.surfaceLight};
  padding: 2rem;
  border-radius: ${props => props.theme.borderRadius.medium};
  border: 1px solid ${props => props.theme.colors.border};
  margin-bottom: 2rem;
`;

const ChartTitle = styled.h3`
  color: ${props => props.theme.colors.primary};
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const DifficultyFilter = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
`;

const FilterButton = styled.button`
  padding: 0.5rem 1rem;
  border: 2px solid ${props => props.active ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.small};
  background: ${props => props.active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.active ? 'white' : props.theme.colors.text};
  cursor: pointer;
  transition: ${props => props.theme.transitions.medium};
  font-weight: 500;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
  }
`;

const BarChart = styled.div`
  display: flex;
  align-items: end;
  gap: 1rem;
  height: 200px;
  padding: 1rem 0;
`;

const Bar = styled(motion.div)`
  flex: 1;
  background: ${props => props.theme.gradients.primary};
  border-radius: ${props => props.theme.borderRadius.small} ${props => props.theme.borderRadius.small} 0 0;
  min-height: 20px;
  display: flex;
  align-items: end;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.5rem;
`;

const BarLabel = styled.div`
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const NoDataMessage = styled.div`
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1.1rem;
  padding: 2rem;
`;

const Statistics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalQuestions: 0,
    easyQuestions: 0,
    mediumQuestions: 0,
    hardQuestions: 0,
    dailyStats: []
  });
  const [selectedFilter, setSelectedFilter] = useState('All');

  useEffect(() => {
    loadStatistics();
  }, [user]);

  const loadStatistics = async () => {
    if (!user) return;

    try {
      // Try Supabase first
      const { data: userStats, error: statsError } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (statsError && statsError.code !== 'PGRST116') {
        console.log('Supabase not available, using localStorage fallback for statistics');
        loadStatisticsLocalStorage();
        return;
      }

      // Get question attempts for detailed stats
      const { data: attempts, error: attemptsError } = await supabase
        .from('question_attempts')
        .select('*')
        .eq('user_id', user.id)
        .order('attempted_at', { ascending: false });

      if (attemptsError) {
        console.log('Supabase not available, using localStorage fallback for statistics');
        loadStatisticsLocalStorage();
        return;
      }

      // Get daily stats for the last 7 days
      const { data: dailyStats, error: dailyError } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (dailyError) {
        console.log('Supabase not available, using localStorage fallback for statistics');
        loadStatisticsLocalStorage();
        return;
      }

      // Calculate statistics from attempts
      const totalQuestions = attempts?.length || 0;
      const easyQuestions = attempts?.filter(a => a.difficulty.toLowerCase() === 'easy').length || 0;
      const mediumQuestions = attempts?.filter(a => a.difficulty.toLowerCase() === 'medium').length || 0;
      const hardQuestions = attempts?.filter(a => a.difficulty.toLowerCase() === 'hard').length || 0;

      // Generate daily stats for the last 7 days
      const last7Days = [];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = dayNames[date.getDay()];
        
        const dayStats = dailyStats?.find(d => d.date === dateStr);
        
        last7Days.push({
          day: dayName,
          easy: dayStats?.easy_questions || 0,
          medium: dayStats?.medium_questions || 0,
          hard: dayStats?.hard_questions || 0
        });
      }

      setStats({
        totalQuestions,
        easyQuestions,
        mediumQuestions,
        hardQuestions,
        dailyStats: last7Days
      });

    } catch (error) {
      console.log('Supabase error, using localStorage fallback for statistics');
      loadStatisticsLocalStorage();
    }
  };

  const loadStatisticsLocalStorage = () => {
    try {
      // Get question attempts from localStorage
      const attempts = JSON.parse(localStorage.getItem(`question_attempts_${user.id}`) || '[]');
      
      // Calculate statistics from attempts
      const totalQuestions = attempts.length;
      const easyQuestions = attempts.filter(a => a.difficulty.toLowerCase() === 'easy').length;
      const mediumQuestions = attempts.filter(a => a.difficulty.toLowerCase() === 'medium').length;
      const hardQuestions = attempts.filter(a => a.difficulty.toLowerCase() === 'hard').length;

      // Get daily stats from localStorage
      const dailyStats = JSON.parse(localStorage.getItem(`daily_stats_${user.id}`) || '{}');
      
      // Generate daily stats for the last 7 days
      const last7Days = [];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = dayNames[date.getDay()];
        
        const dayStats = dailyStats[dateStr];
        
        last7Days.push({
          day: dayName,
          easy: dayStats?.easy_questions || 0,
          medium: dayStats?.medium_questions || 0,
          hard: dayStats?.hard_questions || 0
        });
      }

      setStats({
        totalQuestions,
        easyQuestions,
        mediumQuestions,
        hardQuestions,
        dailyStats: last7Days
      });

      console.log('Statistics loaded from localStorage:', {
        totalQuestions,
        easyQuestions,
        mediumQuestions,
        hardQuestions,
        attempts: attempts.length,
        dailyStats: last7Days
      });

    } catch (error) {
      console.error('Error loading statistics from localStorage:', error);
      // Fallback to empty stats
      setStats({
        totalQuestions: 0,
        easyQuestions: 0,
        mediumQuestions: 0,
        hardQuestions: 0,
        dailyStats: [
          { day: 'Mon', easy: 0, medium: 0, hard: 0 },
          { day: 'Tue', easy: 0, medium: 0, hard: 0 },
          { day: 'Wed', easy: 0, medium: 0, hard: 0 },
          { day: 'Thu', easy: 0, medium: 0, hard: 0 },
          { day: 'Fri', easy: 0, medium: 0, hard: 0 },
          { day: 'Sat', easy: 0, medium: 0, hard: 0 },
          { day: 'Sun', easy: 0, medium: 0, hard: 0 }
        ]
      });
    }
  };

  const getFilteredData = () => {
    if (selectedFilter === 'All') {
      return stats.dailyStats.map(day => day.easy + day.medium + day.hard);
    } else if (selectedFilter === 'Easy') {
      return stats.dailyStats.map(day => day.easy);
    } else if (selectedFilter === 'Medium') {
      return stats.dailyStats.map(day => day.medium);
    } else if (selectedFilter === 'Hard') {
      return stats.dailyStats.map(day => day.hard);
    }
    return [];
  };

  const getMaxValue = () => {
    const data = getFilteredData();
    return Math.max(...data, 1);
  };

  const getBarHeight = (value) => {
    const maxValue = getMaxValue();
    return (value / maxValue) * 100;
  };

  const getTotalForFilter = () => {
    if (selectedFilter === 'All') return stats.totalQuestions;
    if (selectedFilter === 'Easy') return stats.easyQuestions;
    if (selectedFilter === 'Medium') return stats.mediumQuestions;
    if (selectedFilter === 'Hard') return stats.hardQuestions;
    return 0;
  };

  if (!user) {
    return (
      <StatisticsContainer>
        <NoDataMessage>Please log in to view your statistics</NoDataMessage>
      </StatisticsContainer>
    );
  }

  return (
    <StatisticsContainer>
      <Title>📊 Your Learning Statistics</Title>
      
      <StatsGrid>
        <StatCard>
          <StatNumber>{stats.totalQuestions}</StatNumber>
          <StatLabel>Total Questions</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.easyQuestions}</StatNumber>
          <StatLabel>Easy Questions</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.mediumQuestions}</StatNumber>
          <StatLabel>Medium Questions</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.hardQuestions}</StatNumber>
          <StatLabel>Hard Questions</StatLabel>
        </StatCard>
      </StatsGrid>

      <ChartContainer>
        <ChartTitle>Questions Answered This Week</ChartTitle>
        
        <DifficultyFilter>
          <FilterButton 
            active={selectedFilter === 'All'} 
            onClick={() => setSelectedFilter('All')}
          >
            All ({getTotalForFilter()})
          </FilterButton>
          <FilterButton 
            active={selectedFilter === 'Easy'} 
            onClick={() => setSelectedFilter('Easy')}
          >
            Easy ({stats.easyQuestions})
          </FilterButton>
          <FilterButton 
            active={selectedFilter === 'Medium'} 
            onClick={() => setSelectedFilter('Medium')}
          >
            Medium ({stats.mediumQuestions})
          </FilterButton>
          <FilterButton 
            active={selectedFilter === 'Hard'} 
            onClick={() => setSelectedFilter('Hard')}
          >
            Hard ({stats.hardQuestions})
          </FilterButton>
        </DifficultyFilter>

        <BarChart>
          {stats.dailyStats.map((day, index) => {
            const value = getFilteredData()[index];
            const height = getBarHeight(value);
            
            return (
              <div key={day.day} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Bar
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                >
                  {value > 0 && value}
                </Bar>
                <BarLabel>{day.day}</BarLabel>
              </div>
            );
          })}
        </BarChart>
      </ChartContainer>
    </StatisticsContainer>
  );
};

export default Statistics;

