import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Container, Title, Button, Card, Badge } from '../styles/GlobalStyle';

const ResultsContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  padding: 2rem 0;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const ScoreDisplay = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const ScoreCard = styled(Card)`
  text-align: center;
  padding: 2rem;
  min-width: 200px;
`;

const ScoreNumber = styled.div`
  font-size: 3rem;
  font-weight: bold;
  color: ${props => {
    if (props.grade === 'A') return props.theme.colors.success;
    if (props.grade === 'B') return props.theme.colors.warning;
    if (props.grade === 'C') return props.theme.colors.primary;
    return props.theme.colors.error;
  }};
  margin-bottom: 0.5rem;
`;

const ScoreLabel = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const GradeBadge = styled.div`
  background: ${props => {
    if (props.grade === 'A') return props.theme.colors.success;
    if (props.grade === 'B') return props.theme.colors.warning;
    if (props.grade === 'C') return props.theme.colors.primary;
    return props.theme.colors.error;
  }};
  color: white;
  padding: 1rem 2rem;
  border-radius: ${props => props.theme.borderRadius.large};
  font-size: 2rem;
  font-weight: bold;
  box-shadow: ${props => props.theme.shadows.glow};
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const RubricCard = styled(Card)`
  h3 {
    color: ${props => props.theme.colors.primary};
    margin-bottom: 1.5rem;
    text-align: center;
  }
`;

const RubricItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.medium};
`;

const RubricLabel = styled.span`
  color: ${props => props.theme.colors.text};
  font-weight: 600;
`;

const RubricScore = styled.span`
  color: ${props => props.theme.colors.primary};
  font-weight: bold;
  font-size: 1.1rem;
`;

const FeedbackCard = styled(Card)`
  h3 {
    color: ${props => props.theme.colors.primary};
    margin-bottom: 1.5rem;
    text-align: center;
  }
`;

const FeedbackText = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const SuggestionsList = styled.ul`
  list-style: none;
  padding: 0;
`;

const SuggestionItem = styled.li`
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 0.75rem;
  padding-left: 1.5rem;
  position: relative;

  &::before {
    content: '💡';
    position: absolute;
    left: 0;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const NewBadge = styled.div`
  background: ${props => props.theme.gradients.primary};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: ${props => props.theme.borderRadius.medium};
  font-weight: 600;
  text-align: center;
  margin-bottom: 1rem;
  box-shadow: ${props => props.theme.shadows.glow};
  animation: glow 2s ease-in-out infinite;
`;

const Results = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching results (in real app, this would be an API call)
    setTimeout(() => {
      setResults({
        totalScore: 28,
        grade: 'B',
        rubricScores: {
          Logic: 8,
          Clarity: 7,
          Evidence: 6,
          Persuasiveness: 7
        },
        feedback: "Good clarity in questioning, but missed opportunities to challenge the witness's motive and explore alternative suspects.",
        suggestions: [
          "Review the scenario requirements more carefully",
          "Consider multiple perspectives in your analysis",
          "Provide more detailed reasoning for your decisions"
        ],
        newBadges: ['law_expert'],
        scenario: "Cross-examine Theft Witness",
        major: "Law"
      });
      setLoading(false);
    }, 1000);
  }, [attemptId]);

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A': return '#10B981';
      case 'B': return '#F59E0B';
      case 'C': return '#8B5CF6';
      case 'D': return '#EF4444';
      default: return '#8B5CF6';
    }
  };

  const getGradeMessage = (grade) => {
    switch (grade) {
      case 'A': return 'Excellent work!';
      case 'B': return 'Good job!';
      case 'C': return 'Not bad, keep practicing!';
      case 'D': return 'Keep trying!';
      default: return 'Good effort!';
    }
  };

  if (loading) {
    return (
      <ResultsContainer>
        <Container>
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ 
              width: '50px', 
              height: '50px', 
              border: '3px solid #333', 
              borderTop: '3px solid #8B5CF6', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }} />
            <p>Evaluating your performance...</p>
          </div>
        </Container>
      </ResultsContainer>
    );
  }

  if (!results) {
    return (
      <ResultsContainer>
        <Container>
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <h2>Results not found</h2>
            <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
          </div>
        </Container>
      </ResultsContainer>
    );
  }

  return (
    <ResultsContainer>
      <Container>
        <Header>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Title>Scenario Results</Title>
            <p style={{ color: '#B0B0B0', fontSize: '1.1rem', marginBottom: '2rem' }}>
              {results.scenario} - {results.major}
            </p>
          </motion.div>

          {results.newBadges && results.newBadges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <NewBadge>
                🏆 New Badge Unlocked: {results.newBadges[0].replace('_', ' ').toUpperCase()}
              </NewBadge>
            </motion.div>
          )}

          <ScoreDisplay>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <ScoreCard>
                <ScoreNumber grade={results.grade}>{results.totalScore}</ScoreNumber>
                <ScoreLabel>Total Score</ScoreLabel>
              </ScoreCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <GradeBadge grade={results.grade}>
                {results.grade}
              </GradeBadge>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <ScoreCard>
                <ScoreNumber grade={results.grade} style={{ fontSize: '1.5rem' }}>
                  {getGradeMessage(results.grade)}
                </ScoreNumber>
                <ScoreLabel>Performance</ScoreLabel>
              </ScoreCard>
            </motion.div>
          </ScoreDisplay>
        </Header>

        <ContentGrid>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <RubricCard>
              <h3>Rubric Scores</h3>
              {Object.entries(results.rubricScores).map(([category, score]) => (
                <RubricItem key={category}>
                  <RubricLabel>{category}</RubricLabel>
                  <RubricScore>{score}/10</RubricScore>
                </RubricItem>
              ))}
            </RubricCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <FeedbackCard>
              <h3>AI Feedback</h3>
              <FeedbackText>{results.feedback}</FeedbackText>
              
              {results.suggestions && results.suggestions.length > 0 && (
                <>
                  <h4 style={{ color: '#8B5CF6', marginBottom: '1rem' }}>Suggestions for Improvement:</h4>
                  <SuggestionsList>
                    {results.suggestions.map((suggestion, index) => (
                      <SuggestionItem key={index}>{suggestion}</SuggestionItem>
                    ))}
                  </SuggestionsList>
                </>
              )}
            </FeedbackCard>
          </motion.div>
        </ContentGrid>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <ActionButtons>
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
            <Button variant="secondary" onClick={() => navigate(`/scenarios/${results.major}`)}>
              Try Another Scenario
            </Button>
            <Button onClick={() => navigate(`/scenario/${results.major}/${attemptId}`)}>
              Retry This Scenario
            </Button>
            <Button onClick={() => navigate('/leaderboard')}>
              View Leaderboard
            </Button>
          </ActionButtons>
        </motion.div>
      </Container>
    </ResultsContainer>
  );
};

export default Results;
