import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Container, Title, Button, Card, Badge } from '../styles/GlobalStyle';
import RocketLoading from './RocketLoading';
import { recordQuestionAttempt } from '../utils/statistics';

const LawQuestionsContainer = styled.div`
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

const SubjectSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const SubjectCard = styled(Card)`
  cursor: pointer;
  transition: ${props => props.theme.transitions.medium};
  text-align: center;
  padding: 1.5rem;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.glow};
  }

  ${props => props.selected && `
    border-color: ${props.theme.colors.primary};
    box-shadow: ${props.theme.shadows.glow};
  `}
`;

const SubjectIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const SubjectTitle = styled.h3`
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const SubjectDescription = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const FilterButton = styled(Button)`
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  min-width: 80px;
`;

const QuestionCard = styled(Card)`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const QuestionInfo = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const QuestionText = styled.div`
  font-size: 1.2rem;
  line-height: 1.6;
  color: ${props => props.theme.colors.text};
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: ${props => props.theme.colors.surface};
  border-radius: 8px;
  border-left: 4px solid ${props => props.theme.colors.primary};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 2rem;
`;

const ActionButton = styled(Button)`
  min-width: 120px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SolutionCard = styled(Card)`
  margin-top: 2rem;
  padding: 1.5rem;
  background: ${props => props.theme.colors.surface};
  border-left: 4px solid ${props => props.theme.colors.success};
`;

const HintCard = styled(Card)`
  margin-top: 1rem;
  padding: 1rem;
  background: ${props => props.theme.colors.surface};
  border-left: 4px solid ${props => props.theme.colors.warning};
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
`;

const CheckmarkOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const CheckmarkIcon = styled(motion.div)`
  font-size: 8rem;
  color: ${props => props.theme.colors.success};
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const TitleEmoji = styled.span`
  font-size: 2.5rem;
  filter: none;
  -webkit-filter: none;
`;

const TitleText = styled(Title)`
  margin: 0;
`;

const AnswerEvaluationSection = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: ${props => props.isCorrect ? props.theme.colors.success + '20' : props.theme.colors.error + '20'};
  border-radius: ${props => props.theme.borderRadius.medium};
  border: 2px solid ${props => props.isCorrect ? props.theme.colors.success : props.theme.colors.error};
`;

const AnswerEvaluationHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: ${props => props.theme.colors.text};
`;

const ConfidenceBadge = styled.span`
  padding: 4px 8px;
  border-radius: ${props => props.theme.borderRadius.small};
  font-size: 0.8rem;
  font-weight: normal;
  background: ${props => {
    switch (props.confidence) {
      case 'high': return props.theme.colors.success;
      case 'medium': return props.theme.colors.warning;
      case 'low': return props.theme.colors.error;
      default: return props.theme.colors.border;
    }
  }};
  color: white;
`;

const AnswerFeedback = styled.div`
  color: ${props => props.theme.colors.text};
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const AnswerSuggestions = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.6;
  font-style: italic;
`;

const AnswerSection = styled.div`
  margin-bottom: 2rem;
`;

const AnswerTextarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 1rem;
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.medium};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-size: 1rem;
  line-height: 1.5;
  resize: vertical;
  transition: ${props => props.theme.transitions.medium};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }

  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const LawQuestions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subject') || null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('Easy');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState('');
  const [hint, setHint] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [isMarked, setIsMarked] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [answerEvaluation, setAnswerEvaluation] = useState(null);
  const [checkingAnswer, setCheckingAnswer] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const lawSubjects = [
    {
      id: 'accounting_for_commercial_lawyers',
      title: 'Accounting for Commercial Lawyers',
      icon: '📊',
      description: 'Financial statements and accounting principles for legal practice'
    },
    {
      id: 'company_takeovers',
      title: 'Company Takeovers',
      icon: '🏢',
      description: 'Mergers, acquisitions, and corporate restructuring'
    },
    {
      id: 'corporate_governance_directors_duties',
      title: 'Corporate Governance & Directors\' Duties',
      icon: '⚖️',
      description: 'Board responsibilities and corporate compliance'
    },
    {
      id: 'principles_of_corporate_law',
      title: 'Principles of Corporate Law',
      icon: '📜',
      description: 'Fundamental concepts in corporate legal framework'
    }
  ];

  const difficulties = ['Easy', 'Medium', 'Hard'];

  const loadQuestion = useCallback(async () => {
    if (!selectedSubject) return;
    
    setLoading(true);
    try {
      const response = await axios.get(
        `/api/law-questions/${selectedSubject}/${selectedDifficulty.toLowerCase()}/${currentQuestionIndex}`
      );
      setCurrentQuestion(response.data);
      setUserAnswer('');
      setShowSolution(false);
      setShowHint(false);
      setSolution('');
      setHint('');
      setAnswerEvaluation(null);
      setQuestionStartTime(Date.now());
    } catch (error) {
      console.error('Error loading question:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedSubject, selectedDifficulty, currentQuestionIndex]);

  const checkIfMarked = useCallback(() => {
    if (!currentQuestion) return;
    const markedQuestions = JSON.parse(localStorage.getItem(`marked_questions_${user?.id}`) || '[]');
    const questionId = `${selectedSubject}_${selectedDifficulty}_${currentQuestionIndex}`;
    setIsMarked(markedQuestions.some(q => q.id === questionId));
  }, [currentQuestion, selectedSubject, selectedDifficulty, currentQuestionIndex, user?.id]);

  useEffect(() => {
    checkIfMarked();
  }, [checkIfMarked]);

  useEffect(() => {
    loadQuestion();
  }, [loadQuestion]);

  const handleGetSolution = async () => {
    if (!currentQuestion) return;
    
    setLoading(true);
    try {
      const response = await axios.post('/api/law-questions/solution', {
        question: currentQuestion.text,
        subject: selectedSubject,
        difficulty: selectedDifficulty
      });
      setSolution(response.data.solution);
      setShowSolution(true);
      
      // Update user statistics for badges
      if (user?.id) {
        const userStats = JSON.parse(localStorage.getItem(`userStats_${user.id}`) || '{}');
        userStats.solutionsViewed = (userStats.solutionsViewed || 0) + 1;
        localStorage.setItem(`userStats_${user.id}`, JSON.stringify(userStats));
      }
    } catch (error) {
      console.error('Error getting solution:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetHint = async () => {
    if (!currentQuestion) return;
    
    setLoading(true);
    try {
      const response = await axios.post('/api/law-questions/hint', {
        question: currentQuestion.text,
        subject: selectedSubject,
        difficulty: selectedDifficulty,
        hintsUsed: hintsUsed
      }, {
        headers: {
          'user-id': user?.id || 'anonymous'
        }
      });
      setHint(response.data.hint);
      setShowHint(true);
      setHintsUsed(prev => prev + 1);
      
      // Update user statistics for badges
      if (user?.id) {
        const userStats = JSON.parse(localStorage.getItem(`userStats_${user.id}`) || '{}');
        userStats.hintsUsed = (userStats.hintsUsed || 0) + 1;
        localStorage.setItem(`userStats_${user.id}`, JSON.stringify(userStats));
      }
    } catch (error) {
      console.error('Error getting hint:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAnswer = async () => {
    if (!currentQuestion || !userAnswer.trim()) return;
    
    try {
      setCheckingAnswer(true);
      setAnswerEvaluation(null);
      
      const response = await axios.post('/api/law-questions/check-answer', {
        question: currentQuestion.text,
        userAnswer: userAnswer.trim(),
        subject: selectedSubject,
        difficulty: selectedDifficulty
      });
      
      const evaluation = response.data;
      setAnswerEvaluation(evaluation);
      
      // Record the question attempt in Supabase
      if (user?.id && currentQuestion) {
        const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
        await recordQuestionAttempt(
          user.id,
          currentQuestion.id || `${selectedSubject}_${selectedDifficulty}_${currentQuestionIndex}`,
          selectedSubject,
          selectedDifficulty,
          userAnswer.trim(),
          evaluation.isCorrect,
          timeSpent,
          hintsUsed
        );
      }

      // If answer is correct, update statistics
      if (evaluation.isCorrect) {
        setShowCheckmark(true);
        
        // Update user statistics for badges (localStorage fallback)
        if (user?.id) {
          const userStats = JSON.parse(localStorage.getItem(`userStats_${user.id}`) || '{}');
          userStats.totalQuestions = (userStats.totalQuestions || 0) + 1;
          userStats.currentStreak = (userStats.currentStreak || 0) + 1;
          userStats.lawQuestions = (userStats.lawQuestions || 0) + 1;
          localStorage.setItem(`userStats_${user.id}`, JSON.stringify(userStats));
        }
        
        setTimeout(() => {
          setShowCheckmark(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking answer:', error);
      setAnswerEvaluation({
        isCorrect: false,
        confidence: "low",
        feedback: "Unable to check answer. Please try again.",
        suggestions: "Make sure your answer is clear and try again."
      });
    } finally {
      setCheckingAnswer(false);
    }
  };

  const toggleMarkQuestion = () => {
    if (!currentQuestion) return;
    
    const markedQuestions = JSON.parse(localStorage.getItem(`marked_questions_${user?.id}`) || '[]');
    const questionId = `${selectedSubject}_${selectedDifficulty}_${currentQuestionIndex}`;
    const questionData = {
      id: questionId,
      text: currentQuestion.text,
      subject: selectedSubject,
      difficulty: selectedDifficulty,
      index: currentQuestionIndex,
      timestamp: new Date().toISOString()
    };

    if (isMarked) {
      // Remove from marked questions
      const updatedQuestions = markedQuestions.filter(q => q.id !== questionId);
      localStorage.setItem(`marked_questions_${user?.id}`, JSON.stringify(updatedQuestions));
      setIsMarked(false);
    } else {
      // Add to marked questions
      markedQuestions.push(questionData);
      localStorage.setItem(`marked_questions_${user?.id}`, JSON.stringify(markedQuestions));
      setIsMarked(true);
      
      // Update user statistics for badges
      if (user?.id) {
        const userStats = JSON.parse(localStorage.getItem(`userStats_${user.id}`) || '{}');
        userStats.markedQuestions = (userStats.markedQuestions || 0) + 1;
        localStorage.setItem(`userStats_${user.id}`, JSON.stringify(userStats));
      }
    }
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex(prev => prev + 1);
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubjectSelect = (subjectId) => {
    setSelectedSubject(subjectId);
    setCurrentQuestionIndex(0);
    setShowSolution(false);
    setShowHint(false);
    setSolution('');
    setHint('');
    setHintsUsed(0);
  };

  if (!selectedSubject) {
    return (
      <LawQuestionsContainer>
        <Container>
          <Header>
            <TitleContainer>
              <TitleEmoji>⚖️</TitleEmoji>
              <TitleText>Law Questions</TitleText>
            </TitleContainer>
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              ← Back to Dashboard
            </Button>
          </Header>
          
          <SubjectSelector>
            {lawSubjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                onClick={() => handleSubjectSelect(subject.id)}
              >
                <SubjectIcon>{subject.icon}</SubjectIcon>
                <SubjectTitle>{subject.title}</SubjectTitle>
                <SubjectDescription>{subject.description}</SubjectDescription>
                <Badge>100 Questions</Badge>
              </SubjectCard>
            ))}
          </SubjectSelector>
        </Container>
      </LawQuestionsContainer>
    );
  }

  const selectedSubjectData = lawSubjects.find(s => s.id === selectedSubject);

  return (
    <LawQuestionsContainer>
      <Container>
        <Header>
          <div>
            <TitleContainer>
              <TitleEmoji>{selectedSubjectData?.icon}</TitleEmoji>
              <TitleText>{selectedSubjectData?.title}</TitleText>
            </TitleContainer>
            <p style={{ color: '#888', margin: '0.5rem 0 0 0' }}>
              Question {currentQuestionIndex + 1} • {selectedDifficulty} Level
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </Button>
        </Header>

        <FilterBar>
          {difficulties.map((difficulty) => (
            <FilterButton
              key={difficulty}
              variant={selectedDifficulty === difficulty ? 'primary' : 'secondary'}
              onClick={() => setSelectedDifficulty(difficulty)}
            >
              {difficulty}
            </FilterButton>
          ))}
        </FilterBar>

        {loading ? (
          <RocketLoading text="Loading question..." />
        ) : currentQuestion ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <QuestionCard>
              <QuestionHeader>
                <QuestionInfo>
                  <Badge variant="primary">{selectedDifficulty}</Badge>
                  <Badge variant="secondary">Law</Badge>
                </QuestionInfo>
              </QuestionHeader>

              <QuestionText>{currentQuestion.text}</QuestionText>

              <AnswerSection>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  color: '#8B5CF6', 
                  fontWeight: 'bold' 
                }}>
                  Your Answer:
                </label>
                <AnswerTextarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                />
              </AnswerSection>

              <ActionButtons>
                <ActionButton variant="secondary" onClick={handleGetHint}>
                  💡 Hint ({hintsUsed}/5)
                </ActionButton>
                <ActionButton variant="secondary" onClick={handleGetSolution}>
                  📖 Solution
                </ActionButton>
                <ActionButton 
                  variant={isMarked ? "primary" : "secondary"}
                  onClick={toggleMarkQuestion}
                >
                  {isMarked ? "📌 Saved" : "📌 Save Question"}
                </ActionButton>
                <ActionButton 
                  variant="primary" 
                  onClick={handleCheckAnswer}
                  disabled={!userAnswer.trim() || checkingAnswer}
                >
                  {checkingAnswer ? '🤖 Checking...' : '✅ Check Answer'}
                </ActionButton>
              </ActionButtons>

              {showHint && hint && (
                <HintCard>
                  <h4>💡 Hint:</h4>
                  <p>{hint}</p>
                </HintCard>
              )}

              {answerEvaluation && (
                <AnswerEvaluationSection isCorrect={answerEvaluation.isCorrect}>
                  <AnswerEvaluationHeader>
                    {answerEvaluation.isCorrect ? '✅ Correct!' : '❌ Incorrect'}
                    <ConfidenceBadge confidence={answerEvaluation.confidence}>
                      {answerEvaluation.confidence} confidence
                    </ConfidenceBadge>
                  </AnswerEvaluationHeader>
                  <AnswerFeedback>
                    <strong>Feedback:</strong> {answerEvaluation.feedback}
                  </AnswerFeedback>
                  {!answerEvaluation.isCorrect && answerEvaluation.suggestions && (
                    <AnswerSuggestions>
                      <strong>Suggestions:</strong> {answerEvaluation.suggestions}
                    </AnswerSuggestions>
                  )}
                </AnswerEvaluationSection>
              )}

              {showSolution && solution && (
                <SolutionCard>
                  <h4>📖 Solution:</h4>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{solution}</div>
                </SolutionCard>
              )}

              <NavigationButtons>
                <Button 
                  variant="secondary" 
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  ← Previous
                </Button>
                <Button variant="primary" onClick={handleNextQuestion}>
                  Next →
                </Button>
              </NavigationButtons>
            </QuestionCard>
          </motion.div>
        ) : (
          <Card style={{ textAlign: 'center', padding: '3rem' }}>
            <h3>No questions available for this subject and difficulty.</h3>
            <Button variant="primary" onClick={() => setSelectedSubject(null)}>
              Choose Different Subject
            </Button>
          </Card>
        )}
      </Container>

      <AnimatePresence>
        {showCheckmark && (
          <CheckmarkOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CheckmarkIcon
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
            >
              ✅
            </CheckmarkIcon>
          </CheckmarkOverlay>
        )}
      </AnimatePresence>
    </LawQuestionsContainer>
  );
};

export default LawQuestions;
