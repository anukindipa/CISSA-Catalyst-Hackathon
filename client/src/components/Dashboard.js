import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Container, Title, Button, Card } from '../styles/GlobalStyle';
import AvatarCustomizer from './AvatarCustomizer';
import Statistics from './Statistics';

const DashboardContainer = styled.div`
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

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    width: 100%;
    justify-content: space-between;
  }
`;

const UserAvatar = styled.div`
  width: 50px;
  height: 50px;
  min-width: 50px;
  min-height: 50px;
  max-width: 50px;
  max-height: 50px;
  background: ${props => props.theme.gradients.primary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  box-shadow: ${props => props.theme.shadows.glow};
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: ${props => props.theme.transitions.medium};
  flex-shrink: 0;
  aspect-ratio: 1;

  &:hover {
    transform: scale(1.1);
    box-shadow: ${props => props.theme.shadows.glowStrong};
  }

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    width: 50px;
    height: 50px;
    min-width: 50px;
    min-height: 50px;
    max-width: 50px;
    max-height: 50px;
    flex-shrink: 0;
  }
`;

const AvatarBase = styled.div`
  font-size: 2.4rem;
  position: absolute;
  z-index: 1;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const AvatarAccessory = styled.div`
  font-size: 1.2rem;
  position: absolute;
  z-index: 2;
  top: ${props => props.top || '20%'};
  left: ${props => props.left || '50%'};
  transform: translateX(-50%);
`;

const UserDetails = styled.div`
  h3 {
    color: ${props => props.theme.colors.text};
    margin-bottom: 0.25rem;
  }
  p {
    color: ${props => props.theme.colors.textSecondary};
    font-size: 0.9rem;
  }
`;

const MajorSelection = styled.div`
  text-align: center;
  margin: 3rem 0;
`;

const MajorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const MajorCard = styled(Card)`
  text-align: center;
  padding: 2rem;
  cursor: pointer;
  transition: ${props => props.theme.transitions.medium};
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: ${props => props.theme.shadows.glowStrong};
  }

  ${props => props.selected && `
    border-color: ${props.theme.colors.primary};
    box-shadow: ${props.theme.shadows.glow};
  `}
`;

const MajorIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  color: ${props => props.theme.colors.primary};
`;

const MajorTitle = styled.h3`
  color: ${props => props.theme.colors.text};
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const MajorDescription = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 1.5rem;
  line-height: 1.6;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 3rem;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
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

const Dashboard = () => {
  const { user, setUserMajor, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedMajor, setSelectedMajor] = useState(user?.major || null);
  const [loading, setLoading] = useState(false);
  const [showAvatarCustomizer, setShowAvatarCustomizer] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);

  const majors = [
    {
      id: 'law',
      name: 'Law',
      icon: '⚖️',
      description: 'Practice courtroom skills, legal reasoning, and case analysis with AI-powered mock trials and legal scenarios.',
      color: '#8B5CF6'
    },
    {
      id: 'biomed',
      name: 'Biomedical',
      icon: '🏥',
      description: 'Master patient diagnosis, medical decision-making, and clinical reasoning through realistic medical scenarios.',
      color: '#10B981'
    },
    {
      id: 'finance',
      name: 'Finance',
      icon: '💰',
      description: 'Develop investment strategies, financial analysis, and market decision-making skills through dynamic simulations.',
      color: '#F59E0B'
    }
  ];

  const handleMajorSelect = async (major) => {
    setSelectedMajor(major.id);
    setLoading(true);

    const result = await setUserMajor(major.id);
    
    if (result.success) {
      if (major.id === 'finance') {
        navigate('/finance-questions');
      } else if (major.id === 'law') {
        navigate('/law-questions');
      } else if (major.id === 'biomed') {
        navigate('/biomed-questions');
      }
    }
    
    setLoading(false);
  };

  const getInitials = (username) => {
    return username ? username.charAt(0).toUpperCase() : 'U';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <DashboardContainer>
      <Container>
        <Header>
          <UserInfo>
            <UserAvatar 
              onClick={() => setShowAvatarCustomizer(true)}
            >
              {user?.avatar ? (
                <>
                  <AvatarBase>{user.avatar.animal || '🐱'}</AvatarBase>
                  {user.avatar.hat && (
                    <AvatarAccessory top="10%">{user.avatar.hat}</AvatarAccessory>
                  )}
                  {user.avatar.glasses && (
                    <AvatarAccessory top="25%">{user.avatar.glasses}</AvatarAccessory>
                  )}
                </>
              ) : (
                getInitials(user?.username)
              )}
            </UserAvatar>
            <UserDetails>
              <h3>Welcome, {user?.username}!</h3>
              <p>Ready to practice your skills?</p>
            </UserDetails>
          </UserInfo>
          <div style={{ 
            display: 'flex', 
            gap: '1rem',
            flexWrap: 'wrap',
            width: '100%',
            justifyContent: 'flex-end'
          }}>
            <Button variant="secondary" onClick={() => setShowStatistics(true)}>
              📊 Statistics
            </Button>
            <Button variant="secondary" onClick={() => navigate('/marked-questions')}>
              📌 Marked Questions
            </Button>
            <Button variant="secondary" onClick={() => navigate('/leaderboard')}>
              🏆 Leaderboard
            </Button>
            <Button variant="secondary" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </Header>

        <MajorSelection>
          <Title>Choose Your Major</Title>
          <p style={{ color: '#B0B0B0', fontSize: '1.1rem', marginBottom: '2rem' }}>
            Select your field of study to access specialized scenarios and practice sessions
          </p>

          <MajorGrid>
            {majors.map((major, index) => (
              <motion.div
                key={major.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <MajorCard
                  selected={selectedMajor === major.id}
                  onClick={() => handleMajorSelect(major)}
                >
                  <MajorIcon>{major.icon}</MajorIcon>
                  <MajorTitle>{major.name}</MajorTitle>
                  <MajorDescription>{major.description}</MajorDescription>
                  <Button 
                    variant={selectedMajor === major.id ? 'primary' : 'secondary'}
                    disabled={loading}
                  >
                    {loading && selectedMajor === major.id ? 'Loading...' : 'Start Practicing'}
                  </Button>
                </MajorCard>
              </motion.div>
            ))}
          </MajorGrid>
        </MajorSelection>

        <StatsGrid>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <StatCard>
              <StatNumber>15</StatNumber>
              <StatLabel>Scenarios Available</StatLabel>
            </StatCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <StatCard>
              <StatNumber>3</StatNumber>
              <StatLabel>Difficulty Levels</StatLabel>
            </StatCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <StatCard>
              <StatNumber>AI</StatNumber>
              <StatLabel>Powered Feedback</StatLabel>
            </StatCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <StatCard>
              <StatNumber>∞</StatNumber>
              <StatLabel>Retry Attempts</StatLabel>
            </StatCard>
          </motion.div>
        </StatsGrid>

        {/* Avatar Customizer Modal */}
        {showAvatarCustomizer && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            overflow: 'auto',
            padding: '1rem'
          }}>
            <div style={{ 
              maxWidth: '90vw', 
              maxHeight: '90vh', 
              overflow: 'auto',
              width: '100%'
            }}>
              <AvatarCustomizer 
                onSave={() => setShowAvatarCustomizer(false)}
                onCancel={() => setShowAvatarCustomizer(false)}
              />
            </div>
          </div>
        )}

        {/* Statistics Modal */}
        {showStatistics && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            overflow: 'auto',
            padding: '1rem'
          }}>
            <div style={{ 
              position: 'relative', 
              width: '100%', 
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <button
                onClick={() => setShowStatistics(false)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: '#EF4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  zIndex: 1001
                }}
              >
                ×
              </button>
              <Statistics />
            </div>
          </div>
        )}
      </Container>
    </DashboardContainer>
  );
};

export default Dashboard;
