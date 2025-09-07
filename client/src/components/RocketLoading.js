import React from 'react';
import styled, { keyframes } from 'styled-components';

const rocketBlast = keyframes`
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
    opacity: 0.8;
  }
  100% {
    transform: translateY(-40px) rotate(0deg);
    opacity: 0;
  }
`;

const rocketTrail = keyframes`
  0% {
    opacity: 0;
    transform: scaleY(0);
  }
  50% {
    opacity: 1;
    transform: scaleY(1);
  }
  100% {
    opacity: 0;
    transform: scaleY(1.5);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 1rem;
`;

const RocketContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: ${rocketBlast} 2s ease-in-out infinite;
`;

const Rocket = styled.div`
  font-size: 3rem;
  z-index: 2;
  position: relative;
`;

const Trail = styled.div`
  position: absolute;
  bottom: -20px;
  width: 4px;
  height: 30px;
  background: linear-gradient(to bottom, #ff6b6b, #ffa500, #ffff00);
  border-radius: 2px;
  animation: ${rocketTrail} 2s ease-in-out infinite;
  z-index: 1;
`;

const LoadingText = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1.1rem;
  font-weight: 500;
  text-align: center;
`;

const RocketLoading = ({ text = "Loading questions..." }) => {
  return (
    <LoadingContainer>
      <RocketContainer>
        <Rocket>🚀</Rocket>
        <Trail />
      </RocketContainer>
      <LoadingText>{text}</LoadingText>
    </LoadingContainer>
  );
};

export default RocketLoading;

