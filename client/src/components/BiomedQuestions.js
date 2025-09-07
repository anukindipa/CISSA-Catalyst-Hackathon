import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Container, Title, Button, Card, Badge } from '../styles/GlobalStyle';
import RocketLoading from './RocketLoading';

const BiomedQuestionsContainer = styled.div`
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

const BiomedQuestions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subject') || null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('Easy');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState('');
  const [hint, setHint] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [isMarked, setIsMarked] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

  const biomedSubjects = [
    {
      id: 'biomedical_fundamentals',
      title: 'Biomedical Fundamentals',
      icon: '🧬',
      description: 'Core principles of biomedical sciences and healthcare'
    }
  ];

  const difficulties = ['Easy', 'Medium', 'Hard'];

  const loadQuestion = useCallback(async () => {
    if (!selectedSubject) return;
    
    setLoading(true);
    try {
      const response = await axios.get(
        `/api/biomed-questions/${selectedSubject}/${selectedDifficulty.toLowerCase()}/${currentQuestionIndex}`
      );
      setCurrentQuestion(response.data);
      setShowSolution(false);
      setShowHint(false);
      setSolution('');
      setHint('');
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
      const response = await axios.post('/api/biomed-questions/solution', {
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
      const response = await axios.post('/api/biomed-questions/hint', {
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

  const handleMarkCorrect = () => {
    setShowCheckmark(true);
    // Update user statistics for badges
    if (user?.id) {
      const userStats = JSON.parse(localStorage.getItem(`userStats_${user.id}`) || '{}');
      userStats.totalQuestions = (userStats.totalQuestions || 0) + 1;
      userStats.currentStreak = (userStats.currentStreak || 0) + 1;
      userStats.biomedQuestions = (userStats.biomedQuestions || 0) + 1;
      localStorage.setItem(`userStats_${user.id}`, JSON.stringify(userStats));
    }
    setTimeout(() => {
      setShowCheckmark(false);
    }, 2000);
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
      <BiomedQuestionsContainer>
        <Container>
          <Header>
            <TitleContainer>
              <TitleEmoji>🏥</TitleEmoji>
              <TitleText>Biomed Questions</TitleText>
            </TitleContainer>
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              ← Back to Dashboard
            </Button>
          </Header>
          
          <SubjectSelector>
            {biomedSubjects.map((subject) => (
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
      </BiomedQuestionsContainer>
    );
  }

  const selectedSubjectData = biomedSubjects.find(s => s.id === selectedSubject);

  return (
    <BiomedQuestionsContainer>
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
                  <Badge variant="secondary">Biomed</Badge>
                </QuestionInfo>
              </QuestionHeader>

              <QuestionText>{currentQuestion.text}</QuestionText>

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
                <ActionButton variant="success" onClick={handleMarkCorrect}>
                  ✅ Mark as Correct
                </ActionButton>
              </ActionButtons>

              {showHint && hint && (
                <HintCard>
                  <h4>💡 Hint:</h4>
                  <p>{hint}</p>
                </HintCard>
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
    </BiomedQuestionsContainer>
  );
};

export default BiomedQuestions;
