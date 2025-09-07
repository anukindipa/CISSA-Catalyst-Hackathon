import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Container, Title, Subtitle, Button, Input, Card } from '../styles/GlobalStyle';

const HomeContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 50%, #0A0A0A 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const HomeContent = styled.div`
  width: 100%;
  max-width: 1200px;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LoginCard = styled(Card)`
  max-width: 400px;
  width: 100%;
  margin: 20px auto;
  position: relative;
  z-index: 1;
  align-self: center;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  color: ${props => props.theme.colors.text};
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error};
  font-size: 14px;
  margin-top: 8px;
`;

const Logo = styled.div`
  text-align: center;
  margin-top: 2rem;
  margin-bottom: 2rem;
`;

const LogoIcon = styled.div`
  width: 80px;
  height: 80px;
  background: ${props => props.theme.gradients.primary};
  border-radius: 50%;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  box-shadow: ${props => props.theme.shadows.glow};
  animation: float 3s ease-in-out infinite;
`;

const Features = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 3rem;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const FeatureCard = styled(Card)`
  text-align: center;
  padding: 20px;
`;

const FeatureIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: ${props => props.theme.colors.primary};
`;

const FeatureTitle = styled.h3`
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
`;

const FeatureText = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const Home = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <HomeContainer>
      <HomeContent>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Logo>
            <LogoIcon>⚡</LogoIcon>
            <Title>SkillSync</Title>
            <Subtitle>Revolutionary AI-Powered Learning Platform for Global Academic Excellence</Subtitle>
          </Logo>

          <LoginCard>
            <Form onSubmit={handleSubmit}>
              <InputGroup>
                <Label>Username</Label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                />
              </InputGroup>

              <InputGroup>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </InputGroup>

              {error && <ErrorMessage>{error}</ErrorMessage>}

              <Button type="submit" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Form>
            
            <div style={{ 
              marginTop: '1.5rem', 
              textAlign: 'center',
              color: '#8B5CF6'
            }}>
              Don't have an account?{' '}
              <a 
                href="/register" 
                style={{ 
                  color: '#A855F7', 
                  textDecoration: 'none', 
                  fontWeight: '600' 
                }}
                onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                onMouseOut={(e) => e.target.style.textDecoration = 'none'}
              >
                Sign up here
              </a>
            </div>
          </LoginCard>

          <Features>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <FeatureCard>
                <FeatureIcon>🌍</FeatureIcon>
                <FeatureTitle>Global Learning Revolution</FeatureTitle>
                <FeatureText>Empowering millions of students worldwide with AI-driven personalized education across all disciplines</FeatureText>
              </FeatureCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <FeatureCard>
                <FeatureIcon>🚀</FeatureIcon>
                <FeatureTitle>Academic Excellence Accelerator</FeatureTitle>
                <FeatureText>Proven to boost academic performance by 40% through intelligent practice and real-time AI feedback</FeatureText>
              </FeatureCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <FeatureCard>
                <FeatureIcon>⚡</FeatureIcon>
                <FeatureTitle>The "LeetCode" for Every Field</FeatureTitle>
                <FeatureText>Revolutionary practice platform spanning Finance, Law, Medicine, Engineering, and beyond - democratizing skill development</FeatureText>
              </FeatureCard>
            </motion.div>

            {/* <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <FeatureCard>
                <FeatureIcon>🎯</FeatureIcon>
                <FeatureTitle>Hackathon Winner Ready</FeatureTitle>
                <FeatureText>Built with cutting-edge technology, scalable architecture, and innovative AI integration - designed to impress judges and investors</FeatureText>
              </FeatureCard>
            </motion.div> */}
          </Features> 
        </motion.div>
      </HomeContent>
    </HomeContainer>
  );
};

export default Home;
