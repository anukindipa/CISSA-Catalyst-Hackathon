import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Container, Title, Button, Card, Badge } from '../styles/GlobalStyle';

const LibraryContainer = styled.div`
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

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FilterButton = styled(Button)`
  padding: 8px 16px;
  font-size: 14px;
  ${props => props.active && `
    background: ${props.theme.gradients.primary};
    border-color: ${props.theme.colors.primary};
  `}
`;

const ScenariosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
`;

const ScenarioCard = styled(Card)`
  cursor: pointer;
  transition: ${props => props.theme.transitions.medium};
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-8px);
    box-shadow: ${props => props.theme.shadows.glow};
  }
`;

const ScenarioHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const ScenarioTitle = styled.h3`
  color: ${props => props.theme.colors.text};
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  line-height: 1.3;
`;

const ScenarioDescription = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.5;
  margin-bottom: 1.5rem;
`;

const ScenarioFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DifficultyBadge = styled(Badge)`
  background: ${props => {
    switch (props.difficulty) {
      case 'Easy': return props.theme.colors.success;
      case 'Medium': return props.theme.colors.warning;
      case 'Hard': return props.theme.colors.error;
      default: return props.theme.colors.primary;
    }
  }};
`;

const StartButton = styled(Button)`
  padding: 8px 16px;
  font-size: 14px;
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

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const ScenarioLibrary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine major from the current path
  const major = location.pathname.includes('/law') ? 'law' : 'biomed';
  const { logout } = useAuth();
  const [scenarios, setScenarios] = useState([]);
  const [filteredScenarios, setFilteredScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  useEffect(() => {
    fetchScenarios();
  }, [major]);

  useEffect(() => {
    filterScenarios();
  }, [scenarios, selectedDifficulty]);

  const fetchScenarios = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/scenarios/${major}`);
      setScenarios(response.data);
    } catch (error) {
      console.error('Error fetching scenarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterScenarios = () => {
    if (selectedDifficulty === 'All') {
      setFilteredScenarios(scenarios);
    } else {
      setFilteredScenarios(scenarios.filter(scenario => scenario.difficulty === selectedDifficulty));
    }
  };

  const handleScenarioClick = (scenarioId) => {
    navigate(`/scenario/${major}/${scenarioId}`);
  };

  const getMajorIcon = (major) => {
    switch (major) {
      case 'law': return '⚖️';
      case 'biomed': return '🏥';
      case 'finance': return '💰';
      default: return '📚';
    }
  };


  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <LibraryContainer>
        <Container>
          <LoadingContainer>
            <LoadingSpinner />
          </LoadingContainer>
        </Container>
      </LibraryContainer>
    );
  }

  return (
    <LibraryContainer>
      <Container>
        <Header>
          <div>
            <Title style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
              {getMajorIcon(major)} {major.charAt(0).toUpperCase() + major.slice(1)} Scenarios
            </Title>
            <p style={{ color: '#B0B0B0', fontSize: '1.1rem' }}>
              Practice real-world scenarios with AI-powered feedback
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button variant="secondary" onClick={() => navigate('/marked-questions')}>
              Marked Questions
            </Button>
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
            <Button variant="secondary" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </Header>

        <FilterBar>
          {difficulties.map((difficulty) => (
            <FilterButton
              key={difficulty}
              variant="secondary"
              active={selectedDifficulty === difficulty}
              onClick={() => setSelectedDifficulty(difficulty)}
            >
              {difficulty}
            </FilterButton>
          ))}
        </FilterBar>

        {filteredScenarios.length === 0 ? (
          <EmptyState>
            <h3>No scenarios found</h3>
            <p>Try selecting a different difficulty level</p>
          </EmptyState>
        ) : (
          <ScenariosGrid>
            {filteredScenarios.map((scenario, index) => (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <ScenarioCard onClick={() => handleScenarioClick(scenario.id)}>
                  <ScenarioHeader>
                    <div>
                      <ScenarioTitle>{scenario.scenario}</ScenarioTitle>
                    </div>
                    <DifficultyBadge difficulty={scenario.difficulty}>
                      {scenario.difficulty}
                    </DifficultyBadge>
                  </ScenarioHeader>

                  <ScenarioDescription>
                    {scenario.instructions.length > 150 
                      ? `${scenario.instructions.substring(0, 150)}...` 
                      : scenario.instructions
                    }
                  </ScenarioDescription>

                  <ScenarioFooter>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Badge>AI Feedback</Badge>
                      <Badge>Real-time</Badge>
                    </div>
                    <StartButton>Start Scenario</StartButton>
                  </ScenarioFooter>
                </ScenarioCard>
              </motion.div>
            ))}
          </ScenariosGrid>
        )}
      </Container>
    </LibraryContainer>
  );
};

export default ScenarioLibrary;
