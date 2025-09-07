import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';
import { Container, Title, Button, Card, Badge } from '../styles/GlobalStyle';
import RocketLoading from './RocketLoading';
import { recordQuestionAttempt } from '../utils/statistics';

const FinanceQuestionsContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  padding: 2rem 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
`;

const SubjectSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
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
  font-size: 1.2rem;
`;

const SubjectDescription = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const DifficultySelector = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
`;

const DifficultyButton = styled(Button)`
  padding: 8px 16px;
  font-size: 14px;
  ${props => props.active && `
    background: ${props.theme.gradients.primary};
    border-color: ${props.theme.colors.primary};
  `}
`;

const QuestionContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const QuestionCard = styled(Card)`
  padding: 2rem;
  margin-bottom: 2rem;
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
`;

const QuestionNumber = styled.div`
  background: ${props => props.theme.gradients.primary};
  color: white;
  padding: 8px 16px;
  border-radius: ${props => props.theme.borderRadius.small};
  font-weight: bold;
  font-size: 0.9rem;
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

const QuestionText = styled.div`
  color: ${props => props.theme.colors.text};
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  background: ${props => props.theme.colors.surface};
  padding: 1.5rem;
  border-radius: ${props => props.theme.borderRadius.medium};
  border-left: 4px solid ${props => props.theme.colors.primary};
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

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const ActionButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 10px 20px;
  font-size: 14px;
`;

const SolutionSection = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.medium};
  border: 1px solid ${props => props.theme.colors.border};
`;

const SolutionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: ${props => props.theme.colors.primary};
  font-weight: bold;
`;

const SolutionText = styled.div`
  color: ${props => props.theme.colors.text};
  line-height: 1.6;
  
  /* Markdown styling */
  h1, h2, h3, h4, h5, h6 {
    color: ${props => props.theme.colors.primary};
    margin: 1rem 0 0.5rem 0;
  }
  
  p {
    margin: 0.5rem 0;
  }
  
  ul, ol {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }
  
  li {
    margin: 0.25rem 0;
  }
  
  strong {
    color: ${props => props.theme.colors.primary};
    font-weight: bold;
  }
  
  code {
    background: ${props => props.theme.colors.surface};
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
  }
  
  blockquote {
    border-left: 4px solid ${props => props.theme.colors.primary};
    padding-left: 1rem;
    margin: 1rem 0;
    font-style: italic;
  }
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

const HintsSection = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.medium};
  border: 1px solid ${props => props.theme.colors.border};
`;

const HintsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const HintsTitle = styled.div`
  color: ${props => props.theme.colors.primary};
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const HintsRemaining = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const HintItem = styled.div`
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.small};
  border-left: 3px solid ${props => props.theme.colors.primary};
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: ${props => props.theme.colors.surface};
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 1rem;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${props => props.theme.gradients.primary};
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const CheckmarkAnimation = styled(motion.div)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  background: ${props => props.theme.colors.success};
  color: white;
  padding: 2rem;
  border-radius: 50%;
  font-size: 3rem;
  box-shadow: ${props => props.theme.shadows.glowStrong};
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

const FinanceQuestions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('Easy');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [solution, setSolution] = useState('');
  const [hints, setHints] = useState([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMarked, setIsMarked] = useState(false);
  const [answerEvaluation, setAnswerEvaluation] = useState(null);
  const [checkingAnswer, setCheckingAnswer] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const subjects = [
    {
      id: 'international_finance',
      name: 'International Finance',
      icon: '🌍',
      description: 'Foreign exchange, currency markets, and international trade'
    },
    {
      id: 'introductory_personal_finance',
      name: 'Personal Finance',
      icon: '💰',
      description: 'Financial planning, budgeting, and personal investment'
    },
    {
      id: 'investments',
      name: 'Investments',
      icon: '📈',
      description: 'Portfolio theory, CAPM, and investment strategies'
    },
    {
      id: 'macroeconomics',
      name: 'Macroeconomics',
      icon: '🏛️',
      description: 'GDP, inflation, monetary policy, and economic growth'
    },
    {
      id: 'microeconomics',
      name: 'Microeconomics',
      icon: '⚖️',
      description: 'Supply and demand, market structures, and welfare analysis'
    },
    {
      id: 'principles_of_finance',
      name: 'Principles of Finance',
      icon: '🏦',
      description: 'Time value of money, capital budgeting, and risk management'
    },
    {
      id: 'principles_of_management',
      name: 'Management',
      icon: '👥',
      description: 'Organizational behavior, leadership, and strategic management'
    },
    {
      id: 'quantitative_methods',
      name: 'Quantitative Methods',
      icon: '📊',
      description: 'Statistics, regression analysis, and data interpretation'
    },
    {
      id: 'quantitative_methods_2',
      name: 'Quantitative Methods 2',
      icon: '🔢',
      description: 'Advanced statistical methods and model evaluation'
    }
  ];

  const difficulties = ['Easy', 'Medium', 'Hard'];

  const loadQuestion = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading question:', { selectedSubject, selectedDifficulty, currentQuestionIndex, userId: user?.id });
      const response = await axios.get(`/api/finance-questions/${selectedSubject}/${selectedDifficulty}/${currentQuestionIndex}`, {
        headers: {
          'user-id': user?.id || 'anonymous'
        }
      });
      console.log('Question loaded successfully:', response.data);
      setCurrentQuestion(response.data);
      setUserAnswer('');
      setShowSolution(false);
      setSolution('');
      setHints([]);
      setHintsUsed(0);
      setAnswerEvaluation(null);
      setQuestionStartTime(Date.now());
    } catch (error) {
      console.error('Error loading question:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  }, [selectedSubject, selectedDifficulty, currentQuestionIndex, user?.id]);

  useEffect(() => {
    console.log('useEffect triggered:', { selectedSubject, selectedDifficulty, currentQuestionIndex });
    if (selectedSubject && selectedDifficulty) {
      loadQuestion();
    }
  }, [selectedSubject, selectedDifficulty, currentQuestionIndex, loadQuestion]);

  // Handle URL parameter for pre-selected subject
  useEffect(() => {
    const subjectParam = searchParams.get('subject');
    console.log('URL parameter check:', { subjectParam, searchParams: searchParams.toString() });
    if (subjectParam) {
      console.log('Setting selected subject from URL:', subjectParam);
      setSelectedSubject(subjectParam);
    }
  }, [searchParams]);

  const handleGetSolution = async () => {
    if (!currentQuestion) return;
    
    try {
      setLoading(true);
      const response = await axios.post('/api/finance-questions/solution', {
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
    if (hintsUsed >= 5) return;
    
    try {
      setLoading(true);
      const response = await axios.post('/api/finance-questions/hint', {
        question: currentQuestion.text,
        subject: selectedSubject,
        difficulty: selectedDifficulty,
        hintsUsed: hintsUsed
      }, {
        headers: {
          'user-id': user?.id || 'anonymous'
        }
      });
      setHints(prev => [...prev, response.data.hint]);
      setHintsUsed(prev => prev + 1);
      
      // Update user statistics for badges
      if (user?.id) {
        const userStats = JSON.parse(localStorage.getItem(`userStats_${user.id}`) || '{}');
        userStats.hintsUsed = (userStats.hintsUsed || 0) + 1;
        localStorage.setItem(`userStats_${user.id}`, JSON.stringify(userStats));
      }
    } catch (error) {
      console.error('Error getting hint:', error);
      if (error.response?.status === 429) {
        alert('You have reached your daily hint limit of 5 hints. Try again tomorrow!');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAnswer = async () => {
    if (!currentQuestion || !userAnswer.trim()) return;
    
    try {
      setCheckingAnswer(true);
      setAnswerEvaluation(null);
      
      const response = await axios.post('/api/finance-questions/check-answer', {
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
          userStats.financeQuestions = (userStats.financeQuestions || 0) + 1;
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

  const checkIfMarked = useCallback(() => {
    if (!currentQuestion) return;
    const markedQuestions = JSON.parse(localStorage.getItem(`marked_questions_${user?.id}`) || '[]');
    const questionId = `${selectedSubject}_${selectedDifficulty}_${currentQuestionIndex}`;
    setIsMarked(markedQuestions.some(q => q.id === questionId));
  }, [currentQuestion, selectedSubject, selectedDifficulty, currentQuestionIndex, user?.id]);

  useEffect(() => {
    checkIfMarked();
  }, [checkIfMarked]);

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

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const getProgress = () => {
    const totalQuestions = selectedDifficulty === 'Easy' ? 30 : selectedDifficulty === 'Medium' ? 40 : 30;
    return ((currentQuestionIndex + 1) / totalQuestions) * 100;
  };

  if (!selectedSubject) {
    return (
      <FinanceQuestionsContainer>
        <Container>
          <Header>
            <div>
              <TitleContainer>
                <TitleEmoji>📚</TitleEmoji>
                <TitleText style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                  Finance Questions
                </TitleText>
              </TitleContainer>
              <p style={{ color: '#B0B0B0', fontSize: '1.1rem' }}>
                Practice with 100 questions per subject, from basic concepts to advanced analysis
              </p>
            </div>
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </Header>

          <SubjectSelector>
            {subjects.map((subject, index) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <SubjectCard onClick={() => setSelectedSubject(subject.id)}>
                  <SubjectIcon>{subject.icon}</SubjectIcon>
                  <SubjectTitle>{subject.name}</SubjectTitle>
                  <SubjectDescription>{subject.description}</SubjectDescription>
                  <Badge>100 Questions</Badge>
                </SubjectCard>
              </motion.div>
            ))}
          </SubjectSelector>
        </Container>
      </FinanceQuestionsContainer>
    );
  }

  const selectedSubjectData = subjects.find(s => s.id === selectedSubject);

  return (
    <FinanceQuestionsContainer>
      <Container>
        <Header>
          <div>
            <TitleContainer>
              <TitleEmoji>{selectedSubjectData?.icon}</TitleEmoji>
              <TitleText style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                {selectedSubjectData?.name}
              </TitleText>
            </TitleContainer>
            <p style={{ color: '#B0B0B0', fontSize: '1.1rem' }}>
              {selectedSubjectData?.description}
            </p>
          </div>
          <Button variant="secondary" onClick={() => setSelectedSubject(null)}>
            Back to Subjects
          </Button>
        </Header>

        <DifficultySelector>
          {difficulties.map((difficulty) => (
            <DifficultyButton
              key={difficulty}
              variant="secondary"
              active={selectedDifficulty === difficulty}
              onClick={() => {
                setSelectedDifficulty(difficulty);
                setCurrentQuestionIndex(0);
              }}
            >
              {difficulty}
            </DifficultyButton>
          ))}
        </DifficultySelector>

        {loading ? (
          <RocketLoading text="Loading question..." />
        ) : currentQuestion ? (
          <QuestionContainer>
            <ProgressBar>
              <ProgressFill progress={getProgress()} />
            </ProgressBar>
            <p style={{ textAlign: 'center', color: '#B0B0B0', marginBottom: '2rem' }}>
              Question {currentQuestionIndex + 1} of {selectedDifficulty === 'Easy' ? 30 : selectedDifficulty === 'Medium' ? 40 : 30}
            </p>

            <QuestionCard>
              <QuestionHeader>
                <QuestionNumber>Question {currentQuestionIndex + 1}</QuestionNumber>
                <DifficultyBadge difficulty={selectedDifficulty}>
                  {selectedDifficulty}
                </DifficultyBadge>
              </QuestionHeader>

              <QuestionText>
                {currentQuestion.text}
              </QuestionText>

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
                <ActionButton 
                  variant="secondary" 
                  onClick={handleGetHint}
                  disabled={hintsUsed >= 5}
                >
                  💡 Hint ({5 - hintsUsed} remaining)
                </ActionButton>
                <ActionButton 
                  variant="secondary" 
                  onClick={handleGetSolution}
                  disabled={loading}
                >
                  🔍 Solution
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

              {hints.length > 0 && (
                <HintsSection>
                  <HintsHeader>
                    <HintsTitle>
                      💡 Hints
                    </HintsTitle>
                    <HintsRemaining>
                      {5 - hintsUsed} remaining today
                    </HintsRemaining>
                  </HintsHeader>
                  {hints.map((hint, index) => (
                    <HintItem key={index}>
                      <strong>Hint {index + 1}:</strong>
                      <ReactMarkdown>{hint}</ReactMarkdown>
                    </HintItem>
                  ))}
                </HintsSection>
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

              {showSolution && (
                <SolutionSection>
                  <SolutionHeader>
                    🔍 Solution
                  </SolutionHeader>
                  <SolutionText>
                    <ReactMarkdown>{solution}</ReactMarkdown>
                  </SolutionText>
                </SolutionSection>
              )}
            </QuestionCard>

            <NavigationButtons>
              <Button 
                variant="secondary" 
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                ← Previous
              </Button>
              <Button 
                variant="primary" 
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex >= (selectedDifficulty === 'Easy' ? 29 : selectedDifficulty === 'Medium' ? 39 : 29)}
              >
                Next →
              </Button>
            </NavigationButtons>
          </QuestionContainer>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <h3>No questions available</h3>
            <p>Please try a different subject or difficulty level.</p>
          </div>
        )}

        <AnimatePresence>
          {showCheckmark && (
            <CheckmarkAnimation
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              ✅
            </CheckmarkAnimation>
          )}
        </AnimatePresence>
      </Container>
    </FinanceQuestionsContainer>
  );
};

export default FinanceQuestions;
