import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const trophyGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  }
  50% {
    box-shadow: 0 0 40px rgba(255, 215, 0, 0.8);
  }
`;

const BadgeContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const TrophyCard = styled(motion.div)`
  background: ${props => props.theme.gradients.primary};
  padding: 3rem;
  border-radius: ${props => props.theme.borderRadius.large};
  text-align: center;
  border: 3px solid #FFD700;
  animation: ${trophyGlow} 2s ease-in-out infinite;
  max-width: 400px;
  width: 90%;
`;

const TrophyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const BadgeTitle = styled.h2`
  color: white;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
`;

const BadgeDescription = styled.p`
  color: white;
  font-size: 1.2rem;
  margin-bottom: 2rem;
`;

const BadgeSystem = () => {
  const { user } = useAuth();
  const [showBadge, setShowBadge] = useState(false);
  const [currentBadge, setCurrentBadge] = useState(null);

  const badges = {
    first_question: {
      title: "🎯 First Question!",
      description: "You answered your first question!",
      icon: "🎯"
    },
    streak_5: {
      title: "🔥 5 Streak!",
      description: "Amazing! 5 questions in a row!",
      icon: "🔥"
    },
    streak_10: {
      title: "⚡ 10 Streak!",
      description: "Incredible! 10 questions streak!",
      icon: "⚡"
    },
    streak_20: {
      title: "🏆 20 Streak!",
      description: "Legendary! 20 questions streak!",
      icon: "🏆"
    },
    first_hint: {
      title: "💡 Hint Master!",
      description: "You used your first hint!",
      icon: "💡"
    },
    solution_master: {
      title: "🔍 Solution Seeker!",
      description: "You viewed your first solution!",
      icon: "🔍"
    },
    marked_questions: {
      title: "📌 Bookmarker!",
      description: "You saved your first question!",
      icon: "📌"
    },
    finance_expert: {
      title: "💰 Finance Expert!",
      description: "You completed 50 Finance questions!",
      icon: "💰"
    }
  };

  const checkForNewBadges = () => {
    if (!user) return;

    const userStats = JSON.parse(localStorage.getItem(`userStats_${user.id}`) || '{}');
    const userBadges = JSON.parse(localStorage.getItem(`userBadges_${user.id}`) || '[]');
    
    const newBadges = [];

    // Check for first question badge
    if (userStats.totalQuestions >= 1 && !userBadges.includes('first_question')) {
      newBadges.push('first_question');
    }

    // Check for streak badges
    if (userStats.currentStreak >= 5 && !userBadges.includes('streak_5')) {
      newBadges.push('streak_5');
    }
    if (userStats.currentStreak >= 10 && !userBadges.includes('streak_10')) {
      newBadges.push('streak_10');
    }
    if (userStats.currentStreak >= 20 && !userBadges.includes('streak_20')) {
      newBadges.push('streak_20');
    }

    // Check for hint badge
    if (userStats.hintsUsed >= 1 && !userBadges.includes('first_hint')) {
      newBadges.push('first_hint');
    }

    // Check for solution badge
    if (userStats.solutionsViewed >= 1 && !userBadges.includes('solution_master')) {
      newBadges.push('solution_master');
    }

    // Check for marked questions badge
    if (userStats.markedQuestions >= 1 && !userBadges.includes('marked_questions')) {
      newBadges.push('marked_questions');
    }

    // Check for finance expert badge
    if (userStats.financeQuestions >= 50 && !userBadges.includes('finance_expert')) {
      newBadges.push('finance_expert');
    }

    // Show the first new badge
    if (newBadges.length > 0) {
      const badgeId = newBadges[0];
      setCurrentBadge(badges[badgeId]);
      setShowBadge(true);
      
      // Add to user's badges
      const updatedBadges = [...userBadges, badgeId];
      localStorage.setItem(`userBadges_${user.id}`, JSON.stringify(updatedBadges));
      
      // Auto-hide after 4 seconds
      setTimeout(() => {
        setShowBadge(false);
        setCurrentBadge(null);
      }, 4000);
    }
  };

  useEffect(() => {
    const interval = setInterval(checkForNewBadges, 1000);
    return () => clearInterval(interval);
  }, [user]);

  if (!showBadge || !currentBadge) return null;

  return (
    <AnimatePresence>
      <BadgeContainer>
        <TrophyCard
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <TrophyIcon>{currentBadge.icon}</TrophyIcon>
          <BadgeTitle>{currentBadge.title}</BadgeTitle>
          <BadgeDescription>{currentBadge.description}</BadgeDescription>
        </TrophyCard>
      </BadgeContainer>
    </AnimatePresence>
  );
};

export default BadgeSystem;

