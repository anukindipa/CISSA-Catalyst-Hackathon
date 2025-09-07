import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { GlobalStyle, theme } from './styles/GlobalStyle';
import { AuthProvider } from './contexts/AuthContext';
import Home from './components/Home';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ScenarioLibrary from './components/ScenarioLibrary';
import ScenarioInterface from './components/ScenarioInterface';
import Results from './components/Results';
import Leaderboard from './components/Leaderboard';
import MarkedQuestions from './components/MarkedQuestions';
import FinanceQuestions from './components/FinanceQuestions';
import LawQuestions from './components/LawQuestions';
import BiomedQuestions from './components/BiomedQuestions';
import BadgeSystem from './components/BadgeSystem';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/scenarios/law" element={
                <ProtectedRoute>
                  <ScenarioLibrary />
                </ProtectedRoute>
              } />
              <Route path="/scenarios/biomed" element={
                <ProtectedRoute>
                  <ScenarioLibrary />
                </ProtectedRoute>
              } />
              <Route path="/scenario/:major/:scenarioId" element={
                <ProtectedRoute>
                  <ScenarioInterface />
                </ProtectedRoute>
              } />
              <Route path="/results/:attemptId" element={
                <ProtectedRoute>
                  <Results />
                </ProtectedRoute>
              } />
              <Route path="/leaderboard" element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              } />
              <Route path="/marked-questions" element={
                <ProtectedRoute>
                  <MarkedQuestions />
                </ProtectedRoute>
              } />
              <Route path="/finance-questions" element={
                <ProtectedRoute>
                  <FinanceQuestions />
                </ProtectedRoute>
              } />
              <Route path="/law-questions" element={
                <ProtectedRoute>
                  <LawQuestions />
                </ProtectedRoute>
              } />
              <Route path="/biomed-questions" element={
                <ProtectedRoute>
                  <BiomedQuestions />
                </ProtectedRoute>
              } />
            </Routes>
            <BadgeSystem />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
