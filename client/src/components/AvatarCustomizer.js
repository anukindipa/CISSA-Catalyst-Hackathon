import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const AvatarContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.large};
  border: 2px solid ${props => props.theme.colors.border};
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: 1rem;
    gap: 1rem;
  }
`;

const AvatarPreview = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: ${props => props.theme.colors.surfaceLight};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  border: 3px solid ${props => props.theme.colors.primary};
  box-shadow: ${props => props.theme.shadows.glow};
  position: relative;
  overflow: hidden;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    width: 150px;
    height: 150px;
    font-size: 3rem;
  }
`;

const AvatarBase = styled.div`
  font-size: 3.5rem;
  position: absolute;
  z-index: 1;
`;

const AvatarAccessory = styled.div`
  font-size: 1.8rem;
  position: absolute;
  z-index: 2;
  top: ${props => props.top || '20%'};
  left: ${props => props.left || '50%'};
  transform: translateX(-50%);
`;

const CustomizationSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 600px;
`;

const SectionTitle = styled.h3`
  color: ${props => props.theme.colors.primary};
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 1rem;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
  }
`;

const OptionButton = styled.button`
  width: 80px;
  height: 80px;
  border: 2px solid ${props => props.active ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.medium};
  background: ${props => props.active ? props.theme.colors.primary : props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-size: 2rem;
  cursor: pointer;
  transition: ${props => props.theme.transitions.medium};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: ${props => props.theme.shadows.glow};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }
`;

const SaveButton = styled.button`
  background: ${props => props.theme.gradients.primary};
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: ${props => props.theme.borderRadius.medium};
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: ${props => props.theme.transitions.medium};
  box-shadow: ${props => props.theme.shadows.button};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.glowStrong};
  }
`;

const AvatarCustomizer = ({ onSave, onCancel }) => {
  const { user, updateUser } = useAuth();
  const [selectedAnimal, setSelectedAnimal] = useState('🐱');
  const [selectedHat, setSelectedHat] = useState(null);
  const [selectedGlasses, setSelectedGlasses] = useState(null);

  const animals = [
    '🐱', '🐶', '🐰', '🐸', '🐨', '🐼', '🦊', '🐯', '🦁', '🐮',
    '🐷', '🐵', '🐔', '🐧', '🐦', '🦆', '🦅', '🦉', '🦇', '🐺',
    '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🦗', '🐢'
  ];

  const hats = [
    null, '🎩', '👑', '🎓', '⛑️', '🧢', '👒', '🎪', '🎭', '🎨',
    '🎯', '🎲', '🎸', '🎺', '🎻', '🎹', '🎤', '🎧', '🎮', '🎯'
  ];

  const glasses = [
    null, '👓', '🕶️', '🥽', '🤓', '🥸'
  ];


  useEffect(() => {
    if (user?.avatar) {
      setSelectedAnimal(user.avatar.animal || '🐱');
      setSelectedHat(user.avatar.hat || null);
      setSelectedGlasses(user.avatar.glasses || null);
    }
  }, [user]);

  const handleSave = async () => {
    const avatarData = {
      animal: selectedAnimal,
      hat: selectedHat,
      glasses: selectedGlasses
    };

    try {
      await updateUser({ avatar: avatarData });
      localStorage.setItem('userAvatar', JSON.stringify(avatarData));
      onSave && onSave(avatarData);
    } catch (error) {
      console.error('Error saving avatar:', error);
    }
  };

  const getAccessoryPosition = (type) => {
    if (type === 'hat') return { top: '10%' };
    if (type === 'glasses') return { top: '25%' };
    return { top: '20%' };
  };

  return (
    <AvatarContainer>
      <AvatarPreview>
        <AvatarBase>{selectedAnimal}</AvatarBase>
        {selectedHat && (
          <AvatarAccessory {...getAccessoryPosition('hat')}>
            {selectedHat}
          </AvatarAccessory>
        )}
        {selectedGlasses && (
          <AvatarAccessory {...getAccessoryPosition('glasses')}>
            {selectedGlasses}
          </AvatarAccessory>
        )}
      </AvatarPreview>

      <CustomizationSection>
        <div>
          <SectionTitle>CHOOSE YOUR ANIMAL</SectionTitle>
          <OptionsGrid>
            {animals.map((animal, index) => (
              <OptionButton
                key={index}
                active={selectedAnimal === animal}
                onClick={() => setSelectedAnimal(animal)}
              >
                {animal}
              </OptionButton>
            ))}
          </OptionsGrid>
        </div>

        <div>
          <SectionTitle>ADD A HAT</SectionTitle>
          <OptionsGrid>
            {hats.map((hat, index) => (
              <OptionButton
                key={index}
                active={selectedHat === hat}
                onClick={() => setSelectedHat(hat)}
              >
                {hat || '❌'}
              </OptionButton>
            ))}
          </OptionsGrid>
        </div>

        <div>
          <SectionTitle>ADD GLASSES</SectionTitle>
          <OptionsGrid>
            {glasses.map((glass, index) => (
              <OptionButton
                key={index}
                active={selectedGlasses === glass}
                onClick={() => setSelectedGlasses(glass)}
              >
                {glass || '❌'}
              </OptionButton>
            ))}
          </OptionsGrid>
        </div>



        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <SaveButton onClick={handleSave}>
            Save Avatar
          </SaveButton>
          {onCancel && (
            <SaveButton 
              onClick={onCancel}
              style={{ background: props => props.theme.colors.surface, color: props => props.theme.colors.text }}
            >
              Cancel
            </SaveButton>
          )}
        </div>
      </CustomizationSection>
    </AvatarContainer>
  );
};

export default AvatarCustomizer;
