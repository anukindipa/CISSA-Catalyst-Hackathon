import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Container, Title, Button, Card, Badge } from '../styles/GlobalStyle';

const MarkedQuestionsContainer = styled.div`
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

const QuestionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 2rem;
`;

const QuestionCard = styled(Card)`
  padding: 1.5rem;
  position: relative;
  transition: ${props => props.theme.transitions.medium};

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.glow};
  }
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const QuestionTitle = styled.h3`
  color: ${props => props.theme.colors.text};
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  line-height: 1.3;
`;

const QuestionContent = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.5;
  margin-bottom: 1.5rem;
  background: ${props => props.theme.colors.surface};
  padding: 1rem;
  border-radius: ${props => props.theme.borderRadius.small};
  border-left: 4px solid ${props => props.theme.colors.primary};
`;

const QuestionFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MarkedDate = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const RemoveButton = styled(Button)`
  padding: 6px 12px;
  font-size: 12px;
  background: ${props => props.theme.colors.error};
  border-color: ${props => props.theme.colors.error};
  
  &:hover {
    background: ${props => props.theme.colors.error};
    opacity: 0.8;
  }
`;

const PracticeButton = styled(Button)`
  padding: 6px 12px;
  font-size: 12px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const MarkedQuestions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [markedQuestions, setMarkedQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarkedQuestions();
  }, []);

  const loadMarkedQuestions = () => {
    try {
      const saved = localStorage.getItem(`marked_questions_${user?.id}`);
      if (saved) {
        setMarkedQuestions(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading marked questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeMarkedQuestion = (questionId) => {
    const updated = markedQuestions.filter(q => q.id !== questionId);
    setMarkedQuestions(updated);
    localStorage.setItem(`marked_questions_${user?.id}`, JSON.stringify(updated));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMajorIcon = (major) => {
    switch (major) {
      case 'law': return '⚖️';
      case 'biomed': return '🏥';
      case 'finance': return '💰';
      default: return '📚';
    }
  };

  const getMajorColor = (major) => {
    switch (major) {
      case 'law': return '#8B5CF6';
      case 'biomed': return '#10B981';
      case 'finance': return '#F59E0B';
      default: return '#8B5CF6';
    }
  };

  if (loading) {
    return (
      <MarkedQuestionsContainer>
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
            <p>Loading marked questions...</p>
          </div>
        </Container>
      </MarkedQuestionsContainer>
    );
  }

  return (
    <MarkedQuestionsContainer>
      <Container>
        <Header>
          <div>
            <Title style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
              📌 Marked Questions
            </Title>
            <p style={{ color: '#B0B0B0', fontSize: '1.1rem' }}>
              Review and practice questions you've saved for later
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </Header>

        {markedQuestions.length === 0 ? (
          <EmptyState>
            <EmptyIcon>📌</EmptyIcon>
            <h3>No marked questions yet</h3>
            <p>Start practicing scenarios and mark difficult questions to save them here</p>
            <Button 
              variant="primary" 
              onClick={() => navigate('/dashboard')}
              style={{ marginTop: '1rem' }}
            >
              Browse Majors
            </Button>
          </EmptyState>
        ) : (
          <QuestionsGrid>
            {markedQuestions.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <QuestionCard>
                  <QuestionHeader>
                    <div>
                      <QuestionTitle>
                        {getMajorIcon(question.major || 'finance')} {question.scenarioTitle || question.subject || 'Finance Question'}
                      </QuestionTitle>
                      <Badge 
                        style={{ 
                          background: getMajorColor(question.major || 'finance'),
                          fontSize: '0.8rem',
                          padding: '4px 8px'
                        }}
                      >
                        {(question.major || 'finance').charAt(0).toUpperCase() + (question.major || 'finance').slice(1)}
                      </Badge>
                    </div>
                  </QuestionHeader>

                  <QuestionContent>
                    <strong>Question:</strong> {question.questionText || question.text}
                  </QuestionContent>

                  <QuestionFooter>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <MarkedDate>
                        Marked on {formatDate(question.markedDate || question.timestamp)}
                      </MarkedDate>
                      {question.difficulty && (
                        <Badge 
                          style={{ 
                            background: question.difficulty === 'Easy' ? '#4CAF50' : 
                                       question.difficulty === 'Medium' ? '#FF9800' : '#F44336',
                            fontSize: '0.7rem',
                            padding: '2px 6px'
                          }}
                        >
                          {question.difficulty}
                        </Badge>
                      )}
                    </div>
                    <ActionButtons>
                      <RemoveButton 
                        variant="secondary"
                        onClick={() => removeMarkedQuestion(question.id)}
                      >
                        Remove
                      </RemoveButton>
                      <PracticeButton 
                        variant="primary"
                        onClick={() => {
                          if (question.major && question.scenarioId) {
                            navigate(`/scenario/${question.major}/${question.scenarioId}`);
                          } else if (question.subject) {
                            // Determine the correct route based on subject
                            if (question.subject.includes('finance') || 
                                question.subject.includes('investment') ||
                                question.subject.includes('economics') ||
                                question.subject.includes('quantitative')) {
                              navigate(`/finance-questions?subject=${question.subject}`);
                            } else if (question.subject.includes('law') ||
                                       question.subject.includes('corporate') ||
                                       question.subject.includes('accounting') ||
                                       question.subject.includes('governance')) {
                              navigate(`/law-questions?subject=${question.subject}`);
                            } else if (question.subject.includes('biomed') ||
                                       question.subject.includes('medical') ||
                                       question.subject.includes('health')) {
                              navigate(`/biomed-questions?subject=${question.subject}`);
                            } else {
                              // Default to finance for backward compatibility
                              navigate(`/finance-questions?subject=${question.subject}`);
                            }
                          }
                        }}
                      >
                        Practice
                      </PracticeButton>
                    </ActionButtons>
                  </QuestionFooter>
                </QuestionCard>
              </motion.div>
            ))}
          </QuestionsGrid>
        )}
      </Container>
    </MarkedQuestionsContainer>
  );
};

export default MarkedQuestions;
