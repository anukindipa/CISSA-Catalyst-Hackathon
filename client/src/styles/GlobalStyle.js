import styled, { createGlobalStyle } from 'styled-components';

export const theme = {
  colors: {
    primary: '#8B5CF6', // Neon purple
    secondary: '#A855F7',
    accent: '#C084FC',
    background: '#0A0A0A', // Deep black
    surface: '#1A1A1A', // Dark gray
    surfaceLight: '#2A2A2A',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    border: '#333333',
    glow: '#8B5CF6'
  },
  gradients: {
    primary: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
    secondary: 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)',
    glow: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(168, 85, 247, 0.3) 100%)'
  },
  shadows: {
    glow: '0 0 20px rgba(139, 92, 246, 0.5)',
    glowStrong: '0 0 30px rgba(139, 92, 246, 0.8)',
    card: '0 8px 32px rgba(0, 0, 0, 0.3)',
    button: '0 4px 16px rgba(139, 92, 246, 0.3)'
  },
  borderRadius: {
    small: '8px',
    medium: '12px',
    large: '16px',
    xlarge: '24px'
  },
  transitions: {
    fast: '0.2s ease',
    medium: '0.3s ease',
    slow: '0.5s ease'
  },
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1200px'
  }
};

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    background: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
    line-height: 1.6;
    overflow-x: hidden;
    position: relative;
    font-size: 16px;
    
    @media (max-width: ${props => props.theme.breakpoints.mobile}) {
      font-size: 14px;
    }
  }

  body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
      radial-gradient(circle at 20% 20%, rgba(177, 156, 217, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(200, 162, 200, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(221, 160, 221, 0.2) 0%, transparent 60%);
    background-size: 300px 300px, 250px 250px, 400px 400px;
    background-position: 0 0, 150px 150px, 100px 100px;
    pointer-events: none;
    z-index: -2;
  }

  body::after {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
      linear-gradient(30deg, transparent 40%, rgba(177, 156, 217, 0.8) 42%, rgba(177, 156, 217, 0.8) 58%, transparent 60%),
      linear-gradient(-30deg, transparent 40%, rgba(200, 162, 200, 0.8) 42%, rgba(200, 162, 200, 0.8) 58%, transparent 60%),
      linear-gradient(90deg, transparent 40%, rgba(221, 160, 221, 0.8) 42%, rgba(221, 160, 221, 0.8) 58%, transparent 60%);
    background-size: 120px 120px, 120px 120px, 120px 120px;
    background-position: 0 0, 60px 60px, 30px 30px;
    pointer-events: none;
    z-index: -1;
  }

  #root {
    min-height: 100vh;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.surface};
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.primary};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.colors.secondary};
  }

  /* Selection */
  ::selection {
    background: ${props => props.theme.colors.primary};
    color: white;
  }

  /* Focus styles */
  *:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }

  /* Animations */
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.5); }
    50% { box-shadow: 0 0 30px rgba(139, 92, 246, 0.8); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .glow-animation {
    animation: glow 2s ease-in-out infinite;
  }

  .float-animation {
    animation: float 3s ease-in-out infinite;
  }

  .slide-in {
    animation: slideIn 0.6s ease-out;
  }

  .fade-in {
    animation: fadeIn 0.4s ease-out;
  }
`;

// Common styled components
export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: 0 1rem;
  }
`;

export const Card = styled.div`
  background: ${props => props.theme.gradients.secondary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.large};
  padding: 24px;
  box-shadow: ${props => props.theme.shadows.card};
  transition: ${props => props.theme.transitions.medium};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${props => props.theme.gradients.primary};
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.glow};
    border-color: ${props => props.theme.colors.primary};
  }
`;

export const Button = styled.button`
  background: ${props => props.variant === 'secondary' 
    ? props.theme.gradients.secondary 
    : props.theme.gradients.primary};
  border: 2px solid ${props => props.variant === 'secondary' 
    ? props.theme.colors.border 
    : props.theme.colors.primary};
  color: ${props => props.theme.colors.text};
  padding: 12px 24px;
  border-radius: ${props => props.theme.borderRadius.medium};
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.medium};
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.button};
    
    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: 10px 16px;
    font-size: 14px;
    min-height: 44px; /* Touch target size */
  }
`;

export const Input = styled.input`
  background: ${props => props.theme.colors.surface};
  border: 2px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.text};
  padding: 12px 16px;
  border-radius: ${props => props.theme.borderRadius.medium};
  font-size: 16px;
  transition: ${props => props.theme.transitions.medium};
  width: 100%;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }

  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

export const Title = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  background: ${props => props.theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  margin-bottom: 1rem;
  text-shadow: 0 0 30px rgba(139, 92, 246, 0.5);
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 2rem;
  }
`;

export const Subtitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${props => props.theme.colors.textSecondary};
  text-align: center;
  margin-bottom: 2rem;
`;

export const Text = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.6;
  margin-bottom: 1rem;
`;

export const Badge = styled.span`
  background: ${props => props.theme.gradients.primary};
  color: white;
  padding: 4px 12px;
  border-radius: ${props => props.theme.borderRadius.small};
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: ${props => props.theme.shadows.glow};
`;
