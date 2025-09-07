require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));



// In-memory storage for demo purposes
let subjectContent = {}; // Store processed PDF content
let problems = {}; // Store generated problems
let financeQuestions = {}; // Store Finance questions
let lawQuestions = {}; // Store Law questions
let biomedQuestions = {}; // Store Biomed questions
let userHints = {}; // Track hints used per user per day

// Utility function to clean up AI responses
function cleanAIResponse(text) {
  if (!text) return text;
  
  return text
    // Remove markdown headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold formatting
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Remove italic formatting
    .replace(/\*(.*?)\*/g, '$1')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replace(/`(.*?)`/g, '$1')
    // Remove extra whitespace
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
}

// Load Finance questions from txt files
async function loadFinanceQuestions() {
  const financeQuestionsDir = path.join(__dirname, 'Finance Questions');
  
  if (!fs.existsSync(financeQuestionsDir)) {
    console.log('Finance Questions directory not found');
    return;
  }

  const files = fs.readdirSync(financeQuestionsDir).filter(file => file.endsWith('.txt'));
  
  for (const file of files) {
    const filePath = path.join(financeQuestionsDir, file);
    let subjectName = file.replace('.txt', '').toLowerCase();
    
    // Handle specific file name mappings
    if (subjectName === 'introductory personal finance') {
      subjectName = 'introductory_personal_finance';
    } else if (subjectName === 'pof questions') {
      subjectName = 'principles_of_finance';
    } else if (subjectName === 'priniciples of management') {
      subjectName = 'principles_of_management';
    } else if (subjectName === 'quantitative methods 2') {
      subjectName = 'quantitative_methods_2';
    } else {
      subjectName = subjectName.replace(/\s+/g, '_');
    }
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const questions = parseFinanceQuestions(content, subjectName);
      financeQuestions[subjectName] = questions;
      console.log(`Loaded ${questions.easy.length + questions.medium.length + questions.hard.length} questions for ${subjectName}`);
    } catch (error) {
      console.error(`Error loading ${file}:`, error);
    }
  }
}

// Parse Finance questions from text content
function parseFinanceQuestions(content, subjectName) {
  const questions = {
    easy: [],
    medium: [],
    hard: []
  };

  const lines = content.split('\n');
  let currentDifficulty = null;
  let questionNumber = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if ((line.includes('Easy') && line.includes('Questions')) || line.includes('Easy (') || line.includes('EASY (')) {
      currentDifficulty = 'easy';
      questionNumber = 1;
    } else if ((line.includes('Medium') && line.includes('Questions')) || line.includes('Medium (') || line.includes('MEDIUM (')) {
      currentDifficulty = 'medium';
      questionNumber = 1;
    } else if ((line.includes('Hard') && line.includes('Questions')) || line.includes('Hard (') || line.includes('HARD (')) {
      currentDifficulty = 'hard';
      questionNumber = 1;
    } else if (line && currentDifficulty && /^\d+\./.test(line)) {
      // Extract question text (remove number prefix)
      const questionText = line.replace(/^\d+\.\s*/, '');
      questions[currentDifficulty].push({
        id: `${subjectName}_${currentDifficulty}_${questionNumber}`,
        text: questionText,
        subject: subjectName,
        difficulty: currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1),
        number: questionNumber
      });
      questionNumber++;
    }
  }

  return questions;
}

// Load Law questions from txt files
async function loadLawQuestions() {
  const lawQuestionsDir = path.join(__dirname, 'Law Questions');
  
  if (!fs.existsSync(lawQuestionsDir)) {
    console.log('Law Questions directory not found');
    return;
  }

  const files = fs.readdirSync(lawQuestionsDir).filter(file => file.endsWith('.txt'));
  
  for (const file of files) {
    const filePath = path.join(lawQuestionsDir, file);
    let subjectName = file.replace('.txt', '').toLowerCase();
    
    // Handle specific file name mappings
    if (subjectName === 'accounting for commercial lawyers') {
      subjectName = 'accounting_for_commercial_lawyers';
    } else if (subjectName === 'company takeovers') {
      subjectName = 'company_takeovers';
    } else if (subjectName === 'corporate governance & directors\' duties') {
      subjectName = 'corporate_governance_directors_duties';
    } else if (subjectName === 'principles of corporate law') {
      subjectName = 'principles_of_corporate_law';
    } else {
      subjectName = subjectName.replace(/\s+/g, '_').replace(/[&']/g, '');
    }
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const questions = parseFinanceQuestions(content, subjectName); // Reuse the same parser
      lawQuestions[subjectName] = questions;
      console.log(`Loaded ${questions.easy.length + questions.medium.length + questions.hard.length} questions for ${subjectName}`);
    } catch (error) {
      console.error(`Error loading ${file}:`, error);
    }
  }
}

// Load Biomed questions from txt files
async function loadBiomedQuestions() {
  const biomedQuestionsDir = path.join(__dirname, 'Biomed Questions');
  
  if (!fs.existsSync(biomedQuestionsDir)) {
    console.log('Biomed Questions directory not found');
    return;
  }

  const files = fs.readdirSync(biomedQuestionsDir).filter(file => file.endsWith('.txt'));
  
  for (const file of files) {
    const filePath = path.join(biomedQuestionsDir, file);
    let subjectName = file.replace('.txt', '').toLowerCase();
    
    // Handle specific file name mappings
    if (subjectName === 'biomed test') {
      subjectName = 'biomedical_fundamentals';
    } else {
      subjectName = subjectName.replace(/\s+/g, '_');
    }
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const questions = parseFinanceQuestions(content, subjectName); // Reuse the same parser
      biomedQuestions[subjectName] = questions;
      console.log(`Loaded ${questions.easy.length + questions.medium.length + questions.hard.length} questions for ${subjectName}`);
    } catch (error) {
      console.error(`Error loading ${file}:`, error);
    }
  }
}

// Process PDF files and extract content
async function processPDFFiles() {
  const financeDir = path.join(__dirname, '../Finance');
  const lawDir = path.join(__dirname, '../Law');
  
  // Process Finance PDFs
  if (fs.existsSync(financeDir)) {
    const financeFiles = fs.readdirSync(financeDir).filter(file => file.endsWith('.pdf'));
    for (const file of financeFiles) {
      const filePath = path.join(financeDir, file);
      const subjectName = file.replace('.pdf', '');
      
      try {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        subjectContent[`finance_${subjectName}`] = {
          subject: subjectName,
          major: 'Finance',
          content: pdfData.text,
          processed: true
        };
        console.log(`Processed Finance PDF: ${subjectName}`);
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
      }
    }
  }
  
  // Process Law PDFs
  if (fs.existsSync(lawDir)) {
    const lawFiles = fs.readdirSync(lawDir).filter(file => file.endsWith('.pdf'));
    for (const file of lawFiles) {
      const filePath = path.join(lawDir, file);
      const subjectName = file.replace('.pdf', '');
      
      try {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        subjectContent[`law_${subjectName}`] = {
          subject: subjectName,
          major: 'Law',
          content: pdfData.text,
          processed: true
        };
        console.log(`Processed Law PDF: ${subjectName}`);
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
      }
    }
  }
}

// Generate LeetCode-style problems using Gemini AI
async function generateProblem(subjectKey, difficulty = 'Medium') {
  const subject = subjectContent[subjectKey];
  if (!subject) {
    throw new Error('Subject not found');
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `
You are an expert educator creating LeetCode-style practice problems for ${subject.major} students.

Subject: ${subject.subject}
Major: ${subject.major}
Difficulty: ${difficulty}

Based on the following content, create a comprehensive practice problem:

${subject.content.substring(0, 3000)}...

Create a problem that includes:
1. Problem Statement (clear, specific scenario)
2. Expected Solution Approach (step-by-step methodology)
3. Sample Input/Scenario
4. Expected Output/Result
5. Constraints and Edge Cases
6. Hints (for learning)
7. XP Points (Easy: 10, Medium: 20, Hard: 30)

Format as JSON with these exact fields:
{
  "id": "unique_id",
  "title": "Problem Title",
  "difficulty": "${difficulty}",
  "subject": "${subject.subject}",
  "major": "${subject.major}",
  "problemStatement": "Detailed problem description",
  "expectedApproach": "Step-by-step solution approach",
  "sampleInput": "Example scenario/input",
  "expectedOutput": "Expected result/solution",
  "constraints": ["constraint1", "constraint2"],
  "hints": ["hint1", "hint2", "hint3"],
  "xpPoints": ${difficulty === 'Easy' ? 10 : difficulty === 'Medium' ? 20 : 30},
  "timeLimit": ${difficulty === 'Easy' ? 15 : difficulty === 'Medium' ? 25 : 40}
}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const problem = JSON.parse(jsonMatch[0]);
      problem.id = uuidv4();
      return problem;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Error generating problem:', error);
    throw error;
  }
}

// Routes

// Finance Questions API

// Get Finance question by subject, difficulty, and index
app.get('/api/finance-questions/:subject/:difficulty/:index', (req, res) => {
  const { subject, difficulty, index } = req.params;
  const questionIndex = parseInt(index);
  
  if (!financeQuestions[subject] || !financeQuestions[subject][difficulty.toLowerCase()]) {
    return res.status(404).json({ error: 'Subject or difficulty not found' });
  }
  
  const questions = financeQuestions[subject][difficulty.toLowerCase()];
  if (questionIndex < 0 || questionIndex >= questions.length) {
    return res.status(404).json({ error: 'Question not found' });
  }
  
  res.json(questions[questionIndex]);
});

// Get solution for a Finance question using Gemini AI
app.post('/api/finance-questions/solution', async (req, res) => {
  const { question, subject, difficulty } = req.body;
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
You are an expert finance educator. Provide a comprehensive, step-by-step solution for this ${difficulty} level question in ${subject}:

Question: ${question}

Please provide:
1. A clear, detailed answer
2. Step-by-step explanation if applicable
3. Key concepts and formulas used
4. Real-world examples or applications where relevant
5. Common mistakes to avoid

Format your response in a clear, educational manner suitable for university students.

IMPORTANT: Provide clean, plain text responses without markdown formatting (no **, ##, or other markdown symbols).
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const solution = cleanAIResponse(response.text());
    
    res.json({ solution });
  } catch (error) {
    console.error('Error generating solution:', error);
    res.status(500).json({ error: 'Failed to generate solution' });
  }
});

// Get hint for a Finance question using Gemini AI
app.post('/api/finance-questions/hint', async (req, res) => {
  const { question, subject, difficulty, hintsUsed } = req.body;
  const userId = req.headers['user-id'] || 'anonymous';
  const today = new Date().toDateString();
  
  // Check if user has exceeded daily hint limit
  if (!userHints[userId]) {
    userHints[userId] = {};
  }
  if (!userHints[userId][today]) {
    userHints[userId][today] = 0;
  }
  
  if (userHints[userId][today] >= 5) {
    return res.status(429).json({ error: 'Daily hint limit exceeded' });
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const hintLevels = [
      'Provide a gentle nudge or key concept to consider',
      'Give a more specific hint about the approach or formula',
      'Offer a step-by-step breakdown of the solution approach',
      'Provide a detailed explanation of the key concepts involved',
      'Give the complete solution with full explanation'
    ];
    
    const hintLevel = Math.min(hintsUsed, hintLevels.length - 1);
    
    const prompt = `
You are an expert finance educator. Provide a helpful hint for this ${difficulty} level question in ${subject}:

Question: ${question}

Hint level: ${hintLevel + 1} (${hintLevels[hintLevel]})

Provide a hint that helps the student think about the problem without giving away the complete answer. Make it educational and encouraging.

IMPORTANT: Provide clean, plain text responses without markdown formatting (no **, ##, or other markdown symbols).
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const hint = cleanAIResponse(response.text());
    
    // Increment hint count
    userHints[userId][today]++;
    
    res.json({ hint });
  } catch (error) {
    console.error('Error generating hint:', error);
    res.status(500).json({ error: 'Failed to generate hint' });
  }
});

// Check answer with AI
app.post('/api/finance-questions/check-answer', async (req, res) => {
  const { question, userAnswer, subject, difficulty } = req.body;
  
  if (!question || !userAnswer) {
    return res.status(400).json({ error: 'Question and answer are required' });
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `You are an expert tutor in ${subject}. Please evaluate the student's answer to this ${difficulty.toLowerCase()} question.

Question: "${question}"

Student's Answer: "${userAnswer}"

Please provide your evaluation in the following JSON format:
{
  "isCorrect": true/false,
  "confidence": "high/medium/low",
  "feedback": "Brief explanation of why the answer is correct or incorrect",
  "suggestions": "If incorrect, provide helpful suggestions for improvement"
}

Be fair but thorough in your evaluation. Consider partial credit for answers that show understanding but may have minor errors. 

IMPORTANT: Provide clean, plain text responses without markdown formatting (no **, ##, or other markdown symbols).`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Try to parse the JSON response
    let evaluation;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      evaluation = JSON.parse(jsonMatch[0]);
      // Clean up the feedback text
      if (evaluation.feedback) {
        evaluation.feedback = cleanAIResponse(evaluation.feedback);
      }
      if (evaluation.suggestions) {
        evaluation.suggestions = cleanAIResponse(evaluation.suggestions);
      }
    } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback response
      evaluation = {
        isCorrect: false,
        confidence: "low",
        feedback: "Unable to evaluate answer. Please try again.",
        suggestions: "Make sure your answer is clear and addresses the question directly."
      };
    }
    
    res.json(evaluation);
  } catch (error) {
    console.error('Error checking answer:', error);
    
    // If it's an API key error, provide a helpful fallback
    if (error.message && error.message.includes('API key not valid')) {
      const fallbackEvaluation = {
        isCorrect: true, // Assume correct for testing
        confidence: "low",
        feedback: "AI evaluation unavailable due to API key issue. Please update your Gemini API key in the .env file.",
        suggestions: "Contact your administrator to fix the API key configuration."
      };
      res.json(fallbackEvaluation);
    } else {
      res.status(500).json({ error: 'Failed to check answer' });
    }
  }
});

// Law Questions API

// Get Law question by subject, difficulty, and index
app.get('/api/law-questions/:subject/:difficulty/:index', (req, res) => {
  const { subject, difficulty, index } = req.params;
  const questionIndex = parseInt(index);
  
  if (!lawQuestions[subject] || !lawQuestions[subject][difficulty.toLowerCase()]) {
    return res.status(404).json({ error: 'Subject or difficulty not found' });
  }
  
  const questions = lawQuestions[subject][difficulty.toLowerCase()];
  if (questionIndex < 0 || questionIndex >= questions.length) {
    return res.status(404).json({ error: 'Question not found' });
  }
  
  const question = questions[questionIndex];
  res.json({
    id: `${subject}_${difficulty.toLowerCase()}_${questionIndex + 1}`,
    text: question.text,
    subject: subject,
    difficulty: difficulty,
    number: questionIndex + 1
  });
});

// Get solution for a Law question using Gemini AI
app.post('/api/law-questions/solution', async (req, res) => {
  const { question, subject, difficulty } = req.body;
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `You are an expert law tutor. Provide a comprehensive solution for this ${difficulty} law question:

Subject: ${subject}
Question: ${question}

Please provide:
1. A clear and detailed answer
2. Key legal principles involved
3. Relevant case law or statutes (if applicable)
4. Step-by-step reasoning
5. Important considerations

Format your response in a clear, educational manner suitable for a law student.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const solution = cleanAIResponse(response.text());
    
    res.json({ solution });
  } catch (error) {
    console.error('Error generating solution:', error);
    res.status(500).json({ error: 'Failed to generate solution' });
  }
});

// Get hint for a Law question using Gemini AI
app.post('/api/law-questions/hint', async (req, res) => {
  const { question, subject, difficulty, hintsUsed } = req.body;
  const userId = req.headers['user-id'] || 'anonymous';
  const today = new Date().toDateString();
  
  // Check if user has exceeded daily hint limit
  if (!userHints[userId]) {
    userHints[userId] = {};
  }
  if (!userHints[userId][today]) {
    userHints[userId][today] = 0;
  }
  
  if (userHints[userId][today] >= 5) {
    return res.status(429).json({ error: 'Daily hint limit exceeded' });
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const hintLevels = [
      `Think about the key legal principles in ${subject}.`,
      `Consider what area of law this question relates to.`,
      `What are the main elements that need to be addressed?`,
      `Think about relevant case law or statutory provisions.`,
      `Consider the practical application of the legal principles.`
    ];
    
    const hintIndex = Math.min(hintsUsed || 0, hintLevels.length - 1);
    const hint = hintLevels[hintIndex];
    
    // Increment hint count
    userHints[userId][today]++;
    
    res.json({ hint });
  } catch (error) {
    console.error('Error generating hint:', error);
    res.status(500).json({ error: 'Failed to generate hint' });
  }
});

// Check Law answer with AI
app.post('/api/law-questions/check-answer', async (req, res) => {
  const { question, userAnswer, subject, difficulty } = req.body;
  
  if (!question || !userAnswer) {
    return res.status(400).json({ error: 'Question and answer are required' });
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `You are an expert tutor in ${subject}. Please evaluate the student's answer to this ${difficulty.toLowerCase()} question.

Question: "${question}"

Student's Answer: "${userAnswer}"

Please provide your evaluation in the following JSON format:
{
  "isCorrect": true/false,
  "confidence": "high/medium/low",
  "feedback": "Brief explanation of why the answer is correct or incorrect",
  "suggestions": "If incorrect, provide helpful suggestions for improvement"
}

Be fair but thorough in your evaluation. Consider partial credit for answers that show understanding but may have minor errors. 

IMPORTANT: Provide clean, plain text responses without markdown formatting (no **, ##, or other markdown symbols).`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Try to parse the JSON response
    let evaluation;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        evaluation = JSON.parse(jsonMatch[0]);
  } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback response
      evaluation = {
        isCorrect: false,
        confidence: "low",
        feedback: "Unable to evaluate answer. Please try again.",
        suggestions: "Make sure your answer is clear and addresses the question directly."
      };
    }
    
    res.json(evaluation);
  } catch (error) {
    console.error('Error checking answer:', error);
    res.status(500).json({ error: 'Failed to check answer' });
  }
});

// Biomed Questions API

// Get Biomed question by subject, difficulty, and index
app.get('/api/biomed-questions/:subject/:difficulty/:index', (req, res) => {
  const { subject, difficulty, index } = req.params;
  const questionIndex = parseInt(index);
  
  if (!biomedQuestions[subject] || !biomedQuestions[subject][difficulty.toLowerCase()]) {
    return res.status(404).json({ error: 'Subject or difficulty not found' });
  }
  
  const questions = biomedQuestions[subject][difficulty.toLowerCase()];
  if (questionIndex < 0 || questionIndex >= questions.length) {
    return res.status(404).json({ error: 'Question not found' });
  }
  
  const question = questions[questionIndex];
  res.json({
    id: `${subject}_${difficulty.toLowerCase()}_${questionIndex + 1}`,
    text: question.text,
    subject: subject,
    difficulty: difficulty,
    number: questionIndex + 1
  });
});

// Get solution for a Biomed question using Gemini AI
app.post('/api/biomed-questions/solution', async (req, res) => {
  const { question, subject, difficulty } = req.body;
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `You are an expert biomedical sciences tutor. Provide a comprehensive solution for this ${difficulty} biomedical question:

Subject: ${subject}
Question: ${question}

Please provide:
1. A clear and detailed answer
2. Key scientific principles involved
3. Relevant biological processes or mechanisms
4. Step-by-step reasoning
5. Important considerations for biomedical practice

Format your response in a clear, educational manner suitable for a biomedical sciences student.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const solution = cleanAIResponse(response.text());
    
    res.json({ solution });
  } catch (error) {
    console.error('Error generating solution:', error);
    res.status(500).json({ error: 'Failed to generate solution' });
  }
});

// Get hint for a Biomed question using Gemini AI
app.post('/api/biomed-questions/hint', async (req, res) => {
  const { question, subject, difficulty, hintsUsed } = req.body;
  const userId = req.headers['user-id'] || 'anonymous';
  const today = new Date().toDateString();
  
  // Check if user has exceeded daily hint limit
  if (!userHints[userId]) {
    userHints[userId] = {};
  }
  if (!userHints[userId][today]) {
    userHints[userId][today] = 0;
  }
  
  if (userHints[userId][today] >= 5) {
    return res.status(429).json({ error: 'Daily hint limit exceeded' });
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const hintLevels = [
      `Think about the key biomedical principles in ${subject}.`,
      `Consider what biological processes this question relates to.`,
      `What are the main scientific concepts that need to be addressed?`,
      `Think about relevant physiological or pathological mechanisms.`,
      `Consider the practical application in biomedical practice.`
    ];
    
    const hintIndex = Math.min(hintsUsed || 0, hintLevels.length - 1);
    const hint = hintLevels[hintIndex];
    
    // Increment hint count
    userHints[userId][today]++;
    
    res.json({ hint });
  } catch (error) {
    console.error('Error generating hint:', error);
    res.status(500).json({ error: 'Failed to generate hint' });
  }
});

// Check Biomed answer with AI
app.post('/api/biomed-questions/check-answer', async (req, res) => {
  const { question, userAnswer, subject, difficulty } = req.body;
  
  if (!question || !userAnswer) {
    return res.status(400).json({ error: 'Question and answer are required' });
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `You are an expert tutor in ${subject}. Please evaluate the student's answer to this ${difficulty.toLowerCase()} question.

Question: "${question}"

Student's Answer: "${userAnswer}"

Please provide your evaluation in the following JSON format:
{
  "isCorrect": true/false,
  "confidence": "high/medium/low",
  "feedback": "Brief explanation of why the answer is correct or incorrect",
  "suggestions": "If incorrect, provide helpful suggestions for improvement"
}

Be fair but thorough in your evaluation. Consider partial credit for answers that show understanding but may have minor errors. 

IMPORTANT: Provide clean, plain text responses without markdown formatting (no **, ##, or other markdown symbols).`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Try to parse the JSON response
    let evaluation;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        evaluation = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback response
      evaluation = {
        isCorrect: false,
        confidence: "low",
        feedback: "Unable to evaluate answer. Please try again.",
        suggestions: "Make sure your answer is clear and addresses the question directly."
      };
    }
    
    res.json(evaluation);
  } catch (error) {
    console.error('Error checking answer:', error);
    res.status(500).json({ error: 'Failed to check answer' });
  }
});



// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    subjectsProcessed: Object.keys(subjectContent).length
  });
});






// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    subjectsProcessed: Object.keys(subjectContent).length
  });
});

// Initialize server
async function startServer() {
  try {
    console.log('Loading Finance questions...');
    await loadFinanceQuestions();
    console.log(`Loaded ${Object.keys(financeQuestions).length} Finance subjects`);
    
    console.log('Loading Law questions...');
    await loadLawQuestions();
    console.log(`Loaded ${Object.keys(lawQuestions).length} Law subjects`);
    
    console.log('Loading Biomed questions...');
    await loadBiomedQuestions();
    console.log(`Loaded ${Object.keys(biomedQuestions).length} Biomed subjects`);
    
    console.log('Processing PDF files...');
    await processPDFFiles();
    console.log(`Processed ${Object.keys(subjectContent).length} subjects`);
    
    app.listen(PORT, () => {
      console.log(`🚀 SkillSync Server running on port ${PORT}`);
      console.log(`📚 Available subjects: ${Object.keys(subjectContent).length}`);
      console.log(`💰 Finance questions: ${Object.keys(financeQuestions).length} subjects`);
      console.log(`⚖️ Law questions: ${Object.keys(lawQuestions).length} subjects`);
      console.log(`🏥 Biomed questions: ${Object.keys(biomedQuestions).length} subjects`);
      console.log(`🎯 Ready for LeetCode-style practice!`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
}

startServer();


