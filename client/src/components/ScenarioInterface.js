import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Container, Button, Card, Input } from '../styles/GlobalStyle';

const InterfaceContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  padding: 2rem 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const ScenarioInfo = styled.div`
  h2 {
    color: ${props => props.theme.colors.text};
    margin-bottom: 0.5rem;
  }
  p {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  height: calc(100vh - 200px);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    height: auto;
  }
`;

const InstructionsPanel = styled(Card)`
  overflow-y: auto;
`;

const ChatPanel = styled(Card)`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ChatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 1rem;
  padding-right: 0.5rem;
`;

const Message = styled.div`
  margin-bottom: 1rem;
  display: flex;
  ${props => props.isUser ? 'justify-content: flex-end;' : 'justify-content: flex-start;'}
`;

const MessageBubble = styled.div`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: ${props => props.theme.borderRadius.medium};
  background: ${props => props.isUser 
    ? props.theme.gradients.primary 
    : props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  border: 1px solid ${props => props.isUser 
    ? props.theme.colors.primary 
    : props.theme.colors.border};
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    ${props => props.isUser ? 'right: -8px;' : 'left: -8px;'}
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border: 8px solid transparent;
    border-${props => props.isUser ? 'left' : 'right'}-color: ${props => props.isUser 
      ? props.theme.colors.primary 
      : props.theme.colors.surface};
  }
`;

const MessageInput = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const InputField = styled(Input)`
  flex: 1;
  margin: 0;
`;

const SendButton = styled(Button)`
  padding: 12px 20px;
  min-width: 80px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: center;
`;

const Timer = styled.div`
  color: ${props => props.theme.colors.primary};
  font-weight: bold;
  font-size: 1.1rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: ${props => props.theme.colors.surface};
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 1rem;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${props => props.theme.gradients.primary};
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const ScenarioInterface = () => {
  const { major, scenarioId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [scenario, setScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMarked, setIsMarked] = useState(false);
  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchScenario();
    startTimer();
    checkIfMarked();
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchScenario = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/scenarios/${major}/${scenarioId}`);
      setScenario(response.data);
      
      // Initialize with AI welcome message
      setMessages([{
        id: 1,
        text: `Welcome to the ${response.data.scenario} scenario! ${response.data.instructions}`,
        isUser: false,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error fetching scenario:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSubmitting) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsSubmitting(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage, scenario);
      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsSubmitting(false);
    }, 1500);
  };

  const generateAIResponse = (userInput, scenario) => {
    // Simulate AI responses based on scenario type and user input
    const responses = {
      law: [
        "That's an interesting legal argument. Can you elaborate on the evidence supporting this position?",
        "Consider the burden of proof in this case. How would you establish reasonable doubt?",
        "Good point. What about the opposing counsel's potential counterarguments?",
        "Think about the precedent cases. How do they apply to this situation?",
        "Your reasoning is sound. What additional questions would you ask the witness?"
      ],
      biomed: [
        "That's a good diagnostic approach. What additional tests would you consider?",
        "Interesting observation. How would you rule out other differential diagnoses?",
        "Consider the patient's risk factors. How do they influence your assessment?",
        "Good clinical reasoning. What would be your next step in treatment?",
        "Think about the timeline of symptoms. How does this affect your diagnosis?"
      ],
      finance: [
        "That's a solid financial analysis. How do you account for market volatility?",
        "Good risk assessment. What's your exit strategy if the market turns?",
        "Consider the opportunity cost. How does this compare to alternative investments?",
        "Interesting perspective. What about the regulatory environment?",
        "Your calculations look good. How would you hedge against downside risk?"
      ]
    };

    const majorResponses = responses[major] || responses.finance;
    return majorResponses[Math.floor(Math.random() * majorResponses.length)];
  };

  const handleSubmitScenario = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    clearInterval(timerRef.current);

    try {
      const responses = messages.filter(msg => msg.isUser).map(msg => msg.text);
      
      const response = await axios.post('/api/scenarios/submit', {
        userId: user.id,
        scenarioId,
        major,
        responses,
        timeSpent
      });

      if (response.data.success) {
        navigate(`/results/${response.data.attemptId}`);
      }
    } catch (error) {
      console.error('Error submitting scenario:', error);
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const checkIfMarked = () => {
    try {
      const saved = localStorage.getItem(`marked_questions_${user?.id}`);
      if (saved) {
        const markedQuestions = JSON.parse(saved);
        const isAlreadyMarked = markedQuestions.some(q => 
          q.scenarioId === scenarioId && q.major === major
        );
        setIsMarked(isAlreadyMarked);
      }
    } catch (error) {
      console.error('Error checking marked status:', error);
    }
  };

  const toggleMarkQuestion = () => {
    try {
      const saved = localStorage.getItem(`marked_questions_${user?.id}`);
      let markedQuestions = saved ? JSON.parse(saved) : [];

      if (isMarked) {
        // Remove from marked questions
        markedQuestions = markedQuestions.filter(q => 
          !(q.scenarioId === scenarioId && q.major === major)
        );
        setIsMarked(false);
      } else {
        // Add to marked questions
        const newMarkedQuestion = {
          id: `${major}_${scenarioId}_${Date.now()}`,
          scenarioId,
          major,
          scenarioTitle: scenario?.scenario || 'Unknown Scenario',
          questionText: scenario?.instructions || 'Scenario instructions',
          markedDate: new Date().toISOString()
        };
        markedQuestions.push(newMarkedQuestion);
        setIsMarked(true);
      }

      localStorage.setItem(`marked_questions_${user?.id}`, JSON.stringify(markedQuestions));
    } catch (error) {
      console.error('Error toggling marked question:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <InterfaceContainer>
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
            <p>Loading scenario...</p>
          </div>
        </Container>
      </InterfaceContainer>
    );
  }

  if (!scenario) {
    return (
      <InterfaceContainer>
        <Container>
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <h2>Scenario not found</h2>
            <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
          </div>
        </Container>
      </InterfaceContainer>
    );
  }

  return (
    <InterfaceContainer>
      <Container>
        <Header>
          <ScenarioInfo>
            <h2>{scenario.scenario}</h2>
            <p>Difficulty: {scenario.difficulty} • Time: {formatTime(timeSpent)}</p>
          </ScenarioInfo>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button 
              variant={isMarked ? "primary" : "secondary"}
              onClick={toggleMarkQuestion}
              style={{ 
                background: isMarked ? '#8B5CF6' : 'transparent',
                borderColor: isMarked ? '#8B5CF6' : '#333'
              }}
            >
              {isMarked ? '📌 Marked' : '📌 Mark Question'}
            </Button>
            <Button variant="secondary" onClick={() => navigate('/marked-questions')}>
              Marked Questions
            </Button>
            <Button variant="secondary" onClick={() => navigate(`/scenarios/${major}`)}>
              Back to Library
            </Button>
            <Button variant="secondary" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </Header>

        <MainContent>
          <InstructionsPanel>
            <h3 style={{ marginBottom: '1rem', color: '#8B5CF6' }}>Scenario Instructions</h3>
            <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
              {scenario.instructions}
            </p>

            <h4 style={{ marginBottom: '1rem', color: '#B0B0B0' }}>Expected Actions:</h4>
            <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
              {scenario.expected_actions.map((action, index) => (
                <li key={index} style={{ marginBottom: '0.5rem', color: '#B0B0B0' }}>
                  {action}
                </li>
              ))}
            </ul>

            <h4 style={{ marginBottom: '1rem', color: '#B0B0B0' }}>AI Counterpart:</h4>
            <div style={{ background: '#1A1A1A', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              {Object.entries(scenario.ai_counterpart).map(([key, value]) => (
                <div key={key} style={{ marginBottom: '0.5rem' }}>
                  <strong style={{ color: '#8B5CF6' }}>{key}:</strong> {value}
                </div>
              ))}
            </div>

            <ProgressBar>
              <ProgressFill progress={(messages.length / 10) * 100} />
            </ProgressBar>
            <p style={{ fontSize: '0.9rem', color: '#B0B0B0', textAlign: 'center' }}>
              Progress: {messages.length} interactions
            </p>
          </InstructionsPanel>

          <ChatPanel>
            <ChatHeader>
              <h3 style={{ color: '#8B5CF6' }}>AI Simulation</h3>
              <Timer>{formatTime(timeSpent)}</Timer>
            </ChatHeader>

            <ChatMessages>
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Message isUser={message.isUser}>
                      <MessageBubble isUser={message.isUser}>
                        {message.text}
                      </MessageBubble>
                    </Message>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isSubmitting && (
                <Message isUser={false}>
                  <MessageBubble isUser={false}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ 
                        width: '16px', 
                        height: '16px', 
                        border: '2px solid #333', 
                        borderTop: '2px solid #8B5CF6', 
                        borderRadius: '50%', 
                        animation: 'spin 1s linear infinite' 
                      }} />
                      AI is thinking...
                    </div>
                  </MessageBubble>
                </Message>
              )}
              <div ref={messagesEndRef} />
            </ChatMessages>

            <MessageInput>
              <InputField
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your response..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isSubmitting}
              />
              <SendButton 
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isSubmitting}
              >
                Send
              </SendButton>
            </MessageInput>
          </ChatPanel>
        </MainContent>

        <ActionButtons>
          <Button 
            variant="secondary" 
            onClick={() => navigate(`/scenarios/${major}`)}
            disabled={isSubmitting}
          >
            Exit Scenario
          </Button>
          <Button 
            onClick={handleSubmitScenario}
            disabled={isSubmitting || messages.length < 3}
          >
            {isSubmitting ? 'Submitting...' : 'Submit for Evaluation'}
          </Button>
        </ActionButtons>
      </Container>
    </InterfaceContainer>
  );
};

export default ScenarioInterface;
