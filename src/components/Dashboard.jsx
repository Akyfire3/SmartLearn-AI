import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import ReactMarkdown from 'react-markdown';
import { useDocument } from '../context/DocumentContext';
import { generateSummary, generateRevisionNotes, generateQuiz, generateTopics, generateExamQuestions, generateVivaQuestions, testAI } from '../services/aiService';

// Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

function Dashboard() {
  const [activeSection, setActiveSection] = useState('upload');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedRevision, setGeneratedRevision] = useState('');
  const [revisionLoading, setRevisionLoading] = useState(false);
  const [revisionError, setRevisionError] = useState('');
  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState('');
  const [topics, setTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  // Quiz Settings
  const [quizSettings, setQuizSettings] = useState({
    questionCount: 10,
    difficulty: 'Mixed',
    topic: 'All Topics',
    customQuestionCount: ''
  });
  // Exam Questions State
  const examConfigRef = useRef(null);
  const [examQuestions, setExamQuestions] = useState([]);
  const [examLoading, setExamLoading] = useState(false);
  const [examError, setExamError] = useState('');
  const [expandedAnswers, setExpandedAnswers] = useState(new Set());
  const [examSettings, setExamSettings] = useState({
    questionType: 'Two Marks',
    count: 10,
    topic: 'All Topics',
    customCount: ''
  });
  const [generationInfo, setGenerationInfo] = useState(null);
  
  // Viva Questions State
  const vivaConfigRef = useRef(null);
  const [vivaQuestions, setVivaQuestions] = useState([]);
  const [vivaLoading, setVivaLoading] = useState(false);
  const [vivaError, setVivaError] = useState('');
  const [vivaExpanded, setVivaExpanded] = useState(new Set());
  const [vivaMode, setVivaMode] = useState('study'); // 'study' or 'practice'
  const [vivaSettings, setVivaSettings] = useState({
    difficulty: 'Mixed',
    count: 10,
    topic: 'All Topics',
    customCount: ''
  });
  const [vivaGenerationInfo, setVivaGenerationInfo] = useState(null);
  const [testResponse, setTestResponse] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState('');
  const { uploadedFiles, extractedText, setExtractedText, addUploadedFile, removeUploadedFile } = useDocument();

  const sidebarItems = [
    { id: 'upload', label: 'Upload Notes', icon: '📤' },
    { id: 'summary', label: 'Summary', icon: '📝' },
    { id: 'revision', label: 'Revision Notes', icon: '📚' },
    { id: 'quiz', label: 'Quiz', icon: '🎯' },
    { id: 'exam', label: 'Exam Questions', icon: '✍️' },
    { id: 'viva', label: 'Viva Questions', icon: '🎤' },
  ];

  const handleFileUpload = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const arrayBuffer = e.target.result;
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(' ');
        fullText += pageText + '\n\n';
      }
      
      setExtractedText(fullText);
      
      const newFile = {
        id: Date.now().toString(),
        name: file.name,
        size: formatFileSize(file.size),
        uploadTime: new Date().toLocaleString(),
      };
      
      addUploadedFile(newFile);
      
      // Automatically generate topics after text extraction
      await handleGenerateTopics(fullText);
    };
    
    reader.readAsArrayBuffer(file);
  };

  // Update handleGenerateTopics to accept text parameter
  const handleGenerateTopics = async (textToAnalyze) => {
    const text = textToAnalyze || extractedText;
    if (!text) return;
    
    setTopicsLoading(true);
    try {
      const generatedTopics = await generateTopics(text);
      setTopics(generatedTopics);
    } catch (err) {
      console.error('Failed to generate topics:', err);
      // Fallback to empty array
      setTopics([]);
    } finally {
      setTopicsLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setError('');
    try {
      const summary = await generateSummary(extractedText);
      setGeneratedSummary(summary);
    } catch (err) {
      setError(err.message || 'Failed to generate summary');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateRevisionNotes = async () => {
    setRevisionLoading(true);
    setRevisionError('');
    try {
      const notes = await generateRevisionNotes(extractedText);
      setGeneratedRevision(notes);
    } catch (err) {
      setRevisionError(err.message || 'Failed to generate revision notes');
    } finally {
      setRevisionLoading(false);
    }
  };



  const handleGenerateQuiz = async () => {
    if (!extractedText) {
      setQuizError('Please upload a PDF first to generate a quiz');
      return;
    }
    
    setQuizLoading(true);
    setQuizError('');
    setQuizQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setQuizCompleted(false);
    
    try {
      const questionCount = quizSettings.questionCount === 'custom' 
        ? parseInt(quizSettings.customQuestionCount) || 10 
        : parseInt(quizSettings.questionCount);
      
      let quiz = await generateQuiz(
        extractedText, 
        questionCount, 
        quizSettings.difficulty, 
        quizSettings.topic
      );
      
      // Shuffle options for each question
      quiz = quiz.map(question => {
        const shuffledOptions = shuffleArray(question.options);
        return {
          ...question,
          options: shuffledOptions,
          // correctAnswer remains the same - we're just shuffling the order
        };
      });
      
      console.log('✅ Quiz with shuffled options:', quiz);
      
      setQuizQuestions(quiz);
    } catch (err) {
      setQuizError(err.message || 'Failed to generate quiz');
    } finally {
      setQuizLoading(false);
    }
  };

  const handleAnswerSelect = (option) => {
    if (showExplanation) return;
    setSelectedAnswer(option);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === quizQuestions[currentQuestionIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
    
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      if (selectedAnswer === quizQuestions[currentQuestionIndex].correctAnswer) {
        setScore(prev => prev + 1);
      }
      setQuizCompleted(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setQuizCompleted(false);
  };

  const handleGenerateNewQuiz = () => {
    setQuizQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setQuizCompleted(false);
  };

  const handleGenerateExamQuestions = async () => {
    if (!extractedText) {
      setExamError('Please upload a PDF first to generate exam questions');
      return;
    }

    setExamLoading(true);
    setExamError('');
    setExamQuestions([]);
    setExpandedAnswers(new Set());
    setGenerationInfo(null);
    
    const startTime = Date.now();
    
    try {
      const count = examSettings.count === 'custom' 
        ? parseInt(examSettings.customCount) || 10 
        : parseInt(examSettings.count);
      
      const questions = await generateExamQuestions(
        extractedText,
        examSettings.questionType,
        count,
        examSettings.topic
      );
      
      const endTime = Date.now();
      const generationTime = ((endTime - startTime) / 1000).toFixed(1);
      
      setExamQuestions(questions);
      setGenerationInfo({
        totalQuestions: questions.length,
        topic: examSettings.topic,
        questionType: examSettings.questionType,
        generationTime: generationTime
      });
    } catch (err) {
      setExamError(err.message || 'Failed to generate exam questions');
    } finally {
      setExamLoading(false);
    }
  };

  const toggleAnswer = (index) => {
    setExpandedAnswers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedAnswers(new Set(examQuestions.map((_, i) => i)));
  };

  const collapseAll = () => {
    setExpandedAnswers(new Set());
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
      console.log(`${type} copied to clipboard!`);
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  const clearExamResults = () => {
    setExamQuestions([]);
    setExamError('');
    setGenerationInfo(null);
    setExpandedAnswers(new Set());
  };

  const scrollToConfig = () => {
    examConfigRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleGenerateVivaQuestions = async () => {
    if (!extractedText) {
      setVivaError('Please upload a PDF first to generate viva questions');
      return;
    }

    setVivaLoading(true);
    setVivaError('');
    setVivaQuestions([]);
    setVivaExpanded(new Set());
    setVivaGenerationInfo(null);
    
    const startTime = Date.now();
    
    try {
      const count = vivaSettings.count === 'custom' 
        ? parseInt(vivaSettings.customCount) || 10 
        : parseInt(vivaSettings.count);
      
      const questions = await generateVivaQuestions(
        extractedText,
        count,
        vivaSettings.difficulty,
        vivaSettings.topic
      );
      
      const endTime = Date.now();
      const generationTime = ((endTime - startTime) / 1000).toFixed(1);
      
      setVivaQuestions(questions);
      setVivaGenerationInfo({
        totalQuestions: questions.length,
        difficulty: vivaSettings.difficulty,
        topic: vivaSettings.topic,
        generationTime: generationTime
      });
    } catch (err) {
      setVivaError(err.message || 'Failed to generate viva questions');
    } finally {
      setVivaLoading(false);
    }
  };

  const toggleVivaAnswer = (index) => {
    setVivaExpanded(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const expandAllViva = () => {
    setVivaExpanded(new Set(vivaQuestions.map((_, i) => i)));
  };

  const collapseAllViva = () => {
    setVivaExpanded(new Set());
  };

  const clearVivaResults = () => {
    setVivaQuestions([]);
    setVivaError('');
    setVivaGenerationInfo(null);
    setVivaExpanded(new Set());
  };

  const scrollToVivaConfig = () => {
    vivaConfigRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleTestAI = async () => {
    setTestLoading(true);
    setTestError('');
    setTestResponse('');
    try {
      const response = await testAI();
      setTestResponse(response);
    } catch (err) {
      setTestError(err.message || 'Failed to test AI');
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg border border-gray-700"
      >
        <span className="text-xl">☰</span>
      </button>

      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">SL</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              SmartLearn AI
            </span>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          <WelcomeCard documentCount={uploadedFiles.length} />
          <UploadedDocumentSection
            uploadedFiles={uploadedFiles}
            onRemoveFile={removeUploadedFile}
            onUploadNew={() => setActiveSection('upload')}
          />
          <OutputSection
            activeSection={activeSection}
            onFileUpload={handleFileUpload}
            onGenerateSummary={handleGenerateSummary}
            isLoading={isLoading}
            error={error}
            generatedSummary={generatedSummary}
            onGenerateRevision={handleGenerateRevisionNotes}
            revisionLoading={revisionLoading}
            revisionError={revisionError}
            generatedRevision={generatedRevision}
            onGenerateQuiz={handleGenerateQuiz}
            quizLoading={quizLoading}
            quizError={quizError}
            quizQuestions={quizQuestions}
            topics={topics}
            topicsLoading={topicsLoading}
            onGenerateTopics={handleGenerateTopics}
            currentQuestionIndex={currentQuestionIndex}
            score={score}
            selectedAnswer={selectedAnswer}
            showExplanation={showExplanation}
            quizCompleted={quizCompleted}
            quizSettings={quizSettings}
            setQuizSettings={setQuizSettings}
            onAnswerSelect={handleAnswerSelect}
            onSubmitAnswer={handleSubmitAnswer}
            onNextQuestion={handleNextQuestion}
            onRestartQuiz={handleRestartQuiz}
            onGenerateNewQuiz={handleGenerateNewQuiz}
            // Exam Questions Props
            examConfigRef={examConfigRef}
            examQuestions={examQuestions}
            examLoading={examLoading}
            examError={examError}
            expandedAnswers={expandedAnswers}
            examSettings={examSettings}
            setExamSettings={setExamSettings}
            generationInfo={generationInfo}
            onGenerateExamQuestions={handleGenerateExamQuestions}
            onToggleAnswer={toggleAnswer}
            onExpandAll={expandAll}
            onCollapseAll={collapseAll}
            onCopyToClipboard={copyToClipboard}
            onClearExamResults={clearExamResults}
            onScrollToConfig={scrollToConfig}
            // Viva Questions Props
            vivaConfigRef={vivaConfigRef}
            vivaQuestions={vivaQuestions}
            vivaLoading={vivaLoading}
            vivaError={vivaError}
            vivaExpanded={vivaExpanded}
            vivaMode={vivaMode}
            setVivaMode={setVivaMode}
            vivaSettings={vivaSettings}
            setVivaSettings={setVivaSettings}
            vivaGenerationInfo={vivaGenerationInfo}
            onGenerateVivaQuestions={handleGenerateVivaQuestions}
            onToggleVivaAnswer={toggleVivaAnswer}
            onExpandAllViva={expandAllViva}
            onCollapseAllViva={collapseAllViva}
            onClearVivaResults={clearVivaResults}
            onScrollToVivaConfig={scrollToVivaConfig}
            extractedText={extractedText}
          />
          <DebugSection 
            extractedText={extractedText} 
            onTestAI={handleTestAI}
            testLoading={testLoading}
            testError={testError}
            testResponse={testResponse}
          />
        </div>
      </main>
    </div>
  );
}

function WelcomeCard({ documentCount }) {
  const hasKey = typeof import.meta.env.VITE_OPENROUTER_API_KEY !== 'undefined' && import.meta.env.VITE_OPENROUTER_API_KEY !== '';
  
  return (
    <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-8 border border-blue-500/20">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Welcome back! 👋</h2>
          <p className="text-gray-400">Ready to transform your study material into smart learning resources?</p>
          <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${hasKey ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            <span>{hasKey ? '✓' : '✗'}</span>
            <span>VITE_OPENROUTER_API_KEY: {hasKey ? 'Loaded' : 'Not Found'}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {documentCount}
          </div>
          <div className="text-gray-400 text-sm">Documents processed</div>
        </div>
      </div>
    </div>
  );
}

function UploadedDocumentSection({ uploadedFiles, onRemoveFile, onUploadNew }) {
  return (
    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Uploaded Documents</h3>
        <button
          onClick={onUploadNew}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
        >
          Upload New
        </button>
      </div>
      {uploadedFiles.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No documents uploaded yet
        </div>
      ) : (
        <div className="space-y-4">
          {uploadedFiles.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 bg-gray-900 rounded-xl hover:bg-gray-900/80 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
                  <span className="text-2xl">📄</span>
                </div>
                <div>
                  <div className="font-medium">{doc.name}</div>
                  <div className="text-gray-500 text-sm">{doc.uploadTime} • {doc.size}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                  👁️
                </button>
                <button
                  onClick={() => onRemoveFile(doc.id)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OutputSection({ activeSection, onFileUpload, onGenerateSummary, isLoading, error, generatedSummary, onGenerateRevision, revisionLoading, revisionError, generatedRevision, onGenerateQuiz, quizLoading, quizError, quizQuestions, topics, topicsLoading, onGenerateTopics, currentQuestionIndex, score, selectedAnswer, showExplanation, quizCompleted, quizSettings, setQuizSettings, onAnswerSelect, onSubmitAnswer, onNextQuestion, onRestartQuiz, onGenerateNewQuiz, examConfigRef, examQuestions, examLoading, examError, expandedAnswers, examSettings, setExamSettings, generationInfo, onGenerateExamQuestions, onToggleAnswer, onExpandAll, onCollapseAll, onCopyToClipboard, onClearExamResults, onScrollToConfig, vivaConfigRef, vivaQuestions, vivaLoading, vivaError, vivaExpanded, vivaMode, setVivaMode, vivaSettings, setVivaSettings, vivaGenerationInfo, onGenerateVivaQuestions, onToggleVivaAnswer, onExpandAllViva, onCollapseAllViva, onClearVivaResults, onScrollToVivaConfig, extractedText }) {
  const mockData = {
    quiz: [
      { question: 'What is Newton\'s Second Law?', options: ['F = mv', 'F = ma', 'E = mc²', 'v = u + at'], correct: 1 },
      { question: 'Unit of force is?', options: ['Joule', 'Watt', 'Newton', 'Pascal'], correct: 2 },
    ],
    exam: [
      'Derive Newton\'s Second Law of Motion from first principles.',
      'Explain the concept of conservation of energy with examples.',
      'A 10kg object is accelerated at 5m/s². Calculate the force applied.',
    ],
    viva: [
      'What is the difference between mass and weight?',
      'Explain why we jerk forward when a bus stops suddenly.',
      'What is the significance of Newton\'s laws in real life?',
    ],
  };

  const sectionTitles = {
    upload: 'Upload Notes',
    summary: 'AI Summary',
    revision: 'Revision Notes',
    quiz: 'MCQ Quiz',
    exam: 'Exam Questions',
    viva: 'Viva Questions',
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold mb-6">{sectionTitles[activeSection]}</h3>

      {activeSection === 'upload' && (
        <div>
          <input
            type="file"
            id="pdf-upload"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          <label
            htmlFor="pdf-upload"
            className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center hover:border-blue-500 transition-colors cursor-pointer block"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-3xl">📚</span>
            </div>
            <p className="text-gray-400 mb-2">Drag & drop your files here</p>
            <p className="text-gray-500 text-sm">or</p>
            <div className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors inline-block">
              Browse Files
            </div>
            <p className="text-gray-500 text-sm mt-4">Supports PDF only</p>
          </label>
        </div>
      )}

      {activeSection === 'summary' && (
        <div className="space-y-4">
          {!extractedText ? (
            <div className="text-center py-12 text-gray-500">
              Please upload a PDF first to generate a summary
            </div>
          ) : (
            <>
              <button
                onClick={onGenerateSummary}
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Generating Summary...
                  </>
                ) : (
                  'Generate Summary'
                )}
              </button>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400">
                  {error}
                </div>
              )}

              {generatedSummary && (
                <div className="bg-gray-900 rounded-xl p-6">
                  <ReactMarkdown
                    components={{
                      h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-white mb-4 mt-6 first:mt-0" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-blue-400 mb-3 mt-5 first:mt-0" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-purple-400 mb-2 mt-4" {...props} />,
                      h4: ({ node, ...props }) => <h4 className="text-base font-semibold text-gray-200 mb-2 mt-3" {...props} />,
                      p: ({ node, ...props }) => <p className="text-gray-300 mb-3 leading-relaxed" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc list-inside text-gray-300 mb-3 space-y-1" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal list-inside text-gray-300 mb-3 space-y-1" {...props} />,
                      li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                      strong: ({ node, ...props }) => <strong className="text-white font-bold" {...props} />,
                      em: ({ node, ...props }) => <em className="text-gray-400 italic" {...props} />,
                    }}
                  >
                    {generatedSummary}
                  </ReactMarkdown>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeSection === 'revision' && (
        <div className="space-y-4">
          {!extractedText ? (
            <div className="text-center py-12 text-gray-500">
              Please upload a PDF first to generate revision notes
            </div>
          ) : (
            <>
              <button
                onClick={onGenerateRevision}
                disabled={revisionLoading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {revisionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Generating Revision Notes...
                  </>
                ) : (
                  'Generate Revision Notes'
                )}
              </button>

              {revisionError && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400">
                  {revisionError}
                </div>
              )}

              {generatedRevision && (
                <div className="bg-gray-900 rounded-xl p-6">
                  <ReactMarkdown
                    components={{
                      h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-white mb-4 mt-6 first:mt-0" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-blue-400 mb-3 mt-5 first:mt-0" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-purple-400 mb-2 mt-4" {...props} />,
                      h4: ({ node, ...props }) => <h4 className="text-base font-semibold text-gray-200 mb-2 mt-3" {...props} />,
                      p: ({ node, ...props }) => <p className="text-gray-300 mb-3 leading-relaxed" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc list-inside text-gray-300 mb-3 space-y-1" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal list-inside text-gray-300 mb-3 space-y-1" {...props} />,
                      li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                      strong: ({ node, ...props }) => <strong className="text-white font-bold" {...props} />,
                      em: ({ node, ...props }) => <em className="text-gray-400 italic" {...props} />,
                    }}
                  >
                    {generatedRevision}
                  </ReactMarkdown>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeSection === 'quiz' && (
        <div className="space-y-6">
          {!extractedText ? (
            <div className="text-center py-12 text-gray-500">
              Please upload a PDF first to generate a quiz
            </div>
          ) : quizQuestions.length === 0 ? (
            <>
              {/* Quiz Configuration Panel */}
              <div className="bg-gray-900 rounded-xl p-6 space-y-6">
                <h4 className="text-lg font-semibold text-white mb-4">Quiz Configuration</h4>
                
                {/* Number of Questions */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Number of Questions</label>
                  <div className="flex flex-wrap gap-2">
                    {[5, 10, 20].map(num => (
                      <button
                        key={num}
                        onClick={() => setQuizSettings(prev => ({
                          ...prev,
                          questionCount: num
                        }))}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          quizSettings.questionCount === num
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQuizSettings(prev => ({
                          ...prev,
                          questionCount: 'custom'
                        }))}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          quizSettings.questionCount === 'custom'
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        Custom
                      </button>
                      {quizSettings.questionCount === 'custom' && (
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={quizSettings.customQuestionCount}
                          onChange={(e) => setQuizSettings(prev => ({
                            ...prev,
                            customQuestionCount: e.target.value
                          }))}
                          className="w-20 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                  <div className="flex flex-wrap gap-2">
                    {['Easy', 'Medium', 'Hard', 'Mixed'].map(diff => (
                      <button
                        key={diff}
                        onClick={() => setQuizSettings(prev => ({
                          ...prev,
                          difficulty: diff
                        }))}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          quizSettings.difficulty === diff
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Topic Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Topic Selection</label>
                  <div className="flex gap-2 items-center">
                    <select
                      value={quizSettings.topic}
                      onChange={(e) => setQuizSettings(prev => ({
                        ...prev,
                        topic: e.target.value
                      }))}
                      className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="All Topics">All Topics</option>
                      {topics.map((topic, idx) => (
                        <option key={idx} value={topic}>{topic}</option>
                      ))}
                    </select>
                    <button
                      onClick={onGenerateTopics}
                      disabled={topicsLoading}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-all flex items-center justify-center w-10 h-10"
                    >
                      {topicsLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        '🔄'
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={onGenerateQuiz}
                disabled={quizLoading}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {quizLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Generating personalized quiz...
                  </>
                ) : (
                  'Generate Quiz'
                )}
              </button>

              {quizError && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400">
                  {quizError}
                </div>
              )}
            </>
          ) : quizCompleted ? (
            <div className="bg-gray-900 rounded-xl p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-white mb-2">Quiz Complete</h2>
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                {score} / {quizQuestions.length}
              </div>
              <div className="text-2xl text-gray-400 mb-4">
                {Math.round((score / quizQuestions.length * 100))}%
              </div>
              <div className="text-lg font-medium mb-6">
                {score / quizQuestions.length >= 0.9 ? 'Excellent' :
                 score / quizQuestions.length >= 0.75 ? 'Very Good' :
                 score / quizQuestions.length >= 0.5 ? 'Good' : 'Needs Revision'}
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={onRestartQuiz}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
                >
                  Restart Quiz
                </button>
                <button
                  onClick={onGenerateNewQuiz}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-medium transition-colors"
                >
                  Generate New Quiz
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 rounded-xl p-6 space-y-6">
              {/* Header with Progress */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">
                    Question {currentQuestionIndex + 1} of {quizQuestions.length}
                  </span>
                  <span className="text-sm text-blue-400 font-medium">
                    Score: {score}
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${((currentQuestionIndex + (showExplanation ? 1 : 0)) / quizQuestions.length * 100)}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <h3 className="text-xl font-semibold text-white">
                {quizQuestions[currentQuestionIndex].question}
              </h3>

              {/* Options */}
              <div className="space-y-3">
                {quizQuestions[currentQuestionIndex].options.map((option, idx) => {
                  let optionClass = 'border-gray-700 hover:border-gray-600 hover:bg-gray-800';
                  
                  if (showExplanation) {
                    if (option === quizQuestions[currentQuestionIndex].correctAnswer) {
                      optionClass = 'border-green-500 bg-green-500/20';
                    } else if (option === selectedAnswer && option !== quizQuestions[currentQuestionIndex].correctAnswer) {
                      optionClass = 'border-red-500 bg-red-500/20';
                    }
                  } else if (selectedAnswer === option) {
                    optionClass = 'border-blue-500 bg-blue-500/10';
                  }
                  
                  return (
                    <label
                      key={idx}
                      className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${optionClass}`}
                    >
                      <input
                        type="radio"
                        name="quiz-option"
                        value={option}
                        checked={selectedAnswer === option}
                        onChange={() => onAnswerSelect(option)}
                        disabled={showExplanation}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
                      />
                      <span className="text-gray-300">{option}</span>
                    </label>
                  );
                })}
              </div>

              {/* Explanation */}
              {showExplanation && (
                <div className="p-4 rounded-lg border-l-4 bg-gray-800 border-blue-500">
                  <div className="flex items-center gap-2 mb-2">
                    {selectedAnswer === quizQuestions[currentQuestionIndex].correctAnswer ? (
                      <span className="text-green-400 font-medium">✅ Correct</span>
                    ) : (
                      <span className="text-red-400 font-medium">❌ Incorrect</span>
                    )}
                  </div>
                  <p className="text-gray-300">
                    {quizQuestions[currentQuestionIndex].explanation}
                  </p>
                </div>
              )}

              {/* Buttons */}
              {!showExplanation ? (
                <button
                  onClick={onSubmitAnswer}
                  disabled={!selectedAnswer}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={onNextQuestion}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-medium transition-colors"
                >
                  {currentQuestionIndex === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {activeSection === 'exam' && (
        <div className="space-y-6">
          {!extractedText ? (
            <div className="text-center py-12 text-gray-500">
              Please upload a PDF first to generate exam questions
            </div>
          ) : (
            <>
              {/* Exam Configuration Panel - Always Shown */}
              <div ref={examConfigRef} className="bg-gray-900 rounded-xl p-6 space-y-6">
                <h4 className="text-lg font-semibold text-white mb-4">Exam Configuration</h4>
                
                {/* Question Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Question Type</label>
                  <div className="flex flex-wrap gap-2">
                    {['Two Marks', 'Five Marks', 'Ten Marks'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setExamSettings(prev => ({
                          ...prev,
                          questionType: type
                        }))}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          examSettings.questionType === type
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Number of Questions */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Number of Questions</label>
                  <div className="flex flex-wrap gap-2 items-center">
                    {[5, 10, 15].map(num => (
                      <button
                        key={num}
                        onClick={() => setExamSettings(prev => ({
                          ...prev,
                          count: num
                        }))}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          examSettings.count === num
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExamSettings(prev => ({
                          ...prev,
                          count: 'custom'
                        }))}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          examSettings.count === 'custom'
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        Custom
                      </button>
                      {examSettings.count === 'custom' && (
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={examSettings.customCount}
                          onChange={(e) => setExamSettings(prev => ({
                            ...prev,
                            customCount: e.target.value
                          }))}
                          className="w-20 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Topic Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Topic Selection</label>
                  <div className="flex gap-2 items-center">
                    <select
                      value={examSettings.topic}
                      onChange={(e) => setExamSettings(prev => ({
                        ...prev,
                        topic: e.target.value
                      }))}
                      className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="All Topics">All Topics</option>
                      {topics.map((topic, idx) => (
                        <option key={idx} value={topic}>{topic}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => onGenerateTopics(extractedText)}
                      disabled={topicsLoading}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-all flex items-center justify-center w-10 h-10"
                    >
                      {topicsLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        '🔄'
                      )}
                    </button>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={onGenerateExamQuestions}
                    disabled={examLoading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {examLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Generating exam questions...
                      </>
                    ) : (
                      'Generate Questions'
                    )}
                  </button>
                  {examQuestions.length > 0 && (
                    <>
                      <button
                        onClick={onGenerateExamQuestions}
                        disabled={examLoading}
                        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        {examLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Regenerating...
                          </>
                        ) : (
                          'Regenerate'
                        )}
                      </button>
                      <button
                        onClick={onClearExamResults}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
                      >
                        Clear
                      </button>
                    </>
                  )}
                </div>
              </div>

              {examError && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400">
                  {examError}
                </div>
              )}

              {/* Generated Questions - Below Configuration */}
              {examQuestions.length > 0 && (
                <>
                  {/* Generation Info */}
                  {generationInfo && (
                    <div className="bg-gray-900 rounded-xl p-4 flex flex-wrap gap-4 justify-between items-center">
                      <div className="flex flex-wrap gap-4">
                        <div>
                          <span className="text-gray-400 text-sm">Total Questions:</span>
                          <span className="text-white font-medium ml-1">{generationInfo.totalQuestions}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Topic:</span>
                          <span className="text-white font-medium ml-1">{generationInfo.topic}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Question Type:</span>
                          <span className="text-white font-medium ml-1">{generationInfo.questionType}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Generation Time:</span>
                          <span className="text-white font-medium ml-1">{generationInfo.generationTime}s</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={onExpandAll}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-all"
                        >
                          Expand All
                        </button>
                        <button
                          onClick={onCollapseAll}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-all"
                        >
                          Collapse All
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Exam Questions List */}
                  <div className="space-y-4">
                    {examQuestions.map((question, index) => (
                      <div key={index} className="bg-gray-900 rounded-xl p-6 space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <h4 className="text-lg font-semibold text-white flex-1">
                            Question {index + 1}: {question.question}
                          </h4>
                          <button
                            onClick={() => onCopyToClipboard(question.question, 'Question')}
                            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 hover:text-white transition-all flex-shrink-0"
                          >
                            📋
                          </button>
                        </div>
                        
                        {!expandedAnswers.has(index) ? (
                          <button
                            onClick={() => onToggleAnswer(index)}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-all"
                          >
                            Show Answer
                          </button>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <h5 className="text-blue-400 font-medium mb-2">Model Answer</h5>
                                <p className="text-gray-300 whitespace-pre-wrap">{question.answer}</p>
                              </div>
                              <button
                                onClick={() => onCopyToClipboard(question.answer, 'Answer')}
                                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 hover:text-white transition-all flex-shrink-0"
                              >
                                📋
                              </button>
                            </div>
                            
                            {question.keyPoints && question.keyPoints.length > 0 && (
                              <div>
                                <h5 className="text-purple-400 font-medium mb-2">Key Points</h5>
                                <ul className="list-disc list-inside text-gray-300 space-y-1">
                                  {question.keyPoints.map((point, idx) => (
                                    <li key={idx}>{point}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            <button
                              onClick={() => onToggleAnswer(index)}
                              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-all"
                            >
                              Hide Answer
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Back to Config Button */}
                  <div className="flex justify-center">
                    <button
                      onClick={onScrollToConfig}
                      className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 rounded-lg font-medium transition-all flex items-center gap-2"
                    >
                      ↑ Back to Configuration
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
      
      {activeSection === 'viva' && (
        <div className="space-y-6">
          {!extractedText ? (
            <div className="text-center py-12 text-gray-500">
              Please upload a PDF first to generate viva questions
            </div>
          ) : (
            <>
              {/* Viva Configuration Panel */}
              <div ref={vivaConfigRef} className="bg-gray-900 rounded-xl p-6 space-y-6">
                <h4 className="text-lg font-semibold text-white mb-4">Viva Configuration</h4>
                
                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                  <div className="flex flex-wrap gap-2">
                    {['Easy', 'Medium', 'Hard', 'Mixed'].map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setVivaSettings(prev => ({
                          ...prev,
                          difficulty: diff
                        }))}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          vivaSettings.difficulty === diff
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Number of Questions */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Number of Questions</label>
                  <div className="flex flex-wrap gap-2 items-center">
                    {[5, 10, 15].map(num => (
                      <button
                        key={num}
                        onClick={() => setVivaSettings(prev => ({
                          ...prev,
                          count: num
                        }))}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          vivaSettings.count === num
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setVivaSettings(prev => ({
                          ...prev,
                          count: 'custom'
                        }))}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          vivaSettings.count === 'custom'
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        Custom
                      </button>
                      {vivaSettings.count === 'custom' && (
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={vivaSettings.customCount}
                          onChange={(e) => setVivaSettings(prev => ({
                            ...prev,
                            customCount: e.target.value
                          }))}
                          className="w-20 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        />
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Topic Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Topic Selection</label>
                  <div className="flex gap-2 items-center">
                    <select
                      value={vivaSettings.topic}
                      onChange={(e) => setVivaSettings(prev => ({
                        ...prev,
                        topic: e.target.value
                      }))}
                      className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="All Topics">All Topics</option>
                      {topics.map((topic, idx) => (
                        <option key={idx} value={topic}>{topic}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => onGenerateTopics(extractedText)}
                      disabled={topicsLoading}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-all flex items-center justify-center w-10 h-10"
                    >
                      {topicsLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        '🔄'
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={onGenerateVivaQuestions}
                    disabled={vivaLoading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {vivaLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Generating Viva Questions...
                      </>
                    ) : (
                      'Generate Viva Questions'
                    )}
                  </button>
                  {vivaQuestions.length > 0 && (
                    <>
                      <button
                        onClick={onGenerateVivaQuestions}
                        disabled={vivaLoading}
                        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        {vivaLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Regenerating...
                          </>
                        ) : (
                          'Regenerate'
                        )}
                      </button>
                      <button
                        onClick={onClearVivaResults}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
                      >
                        Clear
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {vivaError && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400">
                  {vivaError}
                </div>
              )}
              
              {/* Generated Viva Questions */}
              {vivaQuestions.length > 0 && (
                <>
                  {/* Mode Toggle */}
                  <div className="flex justify-center mb-6">
                    <div className="bg-gray-900 rounded-full p-1 flex items-center gap-1">
                      <button
                        onClick={() => setVivaMode('study')}
                        className={`px-6 py-2 rounded-full font-medium transition-all ${
                          vivaMode === 'study'
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        Study Mode
                      </button>
                      <button
                        onClick={() => setVivaMode('practice')}
                        className={`px-6 py-2 rounded-full font-medium transition-all ${
                          vivaMode === 'practice'
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        Practice Mode
                      </button>
                    </div>
                  </div>
                  
                  {/* Statistics Panel */}
                  {vivaGenerationInfo && (
                    <div className="bg-gray-900 rounded-xl p-4 flex flex-wrap gap-4 justify-between items-center">
                      <div className="flex flex-wrap gap-4">
                        <div>
                          <span className="text-gray-400 text-sm">Total Questions:</span>
                          <span className="text-white font-medium ml-1">{vivaGenerationInfo.totalQuestions}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Difficulty:</span>
                          <span className="text-white font-medium ml-1">{vivaGenerationInfo.difficulty}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Topic:</span>
                          <span className="text-white font-medium ml-1">{vivaGenerationInfo.topic}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Generation Time:</span>
                          <span className="text-white font-medium ml-1">{vivaGenerationInfo.generationTime}s</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={onExpandAllViva}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-all"
                        >
                          Expand All
                        </button>
                        <button
                          onClick={onCollapseAllViva}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-all"
                        >
                          Collapse All
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Viva Questions List */}
                  <div className="space-y-4">
                    {vivaQuestions.map((question, index) => (
                      <div key={index} className="bg-gray-900 rounded-xl p-6 space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-white">
                              Question {index + 1}: {question.question}
                            </h4>
                            <div className="mt-2">
                              <span className="text-sm text-gray-400">Difficulty: </span>
                              <span className="text-sm font-medium text-yellow-400">{question.difficulty}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => onCopyToClipboard(question.question, 'Question')}
                            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 hover:text-white transition-all flex-shrink-0"
                          >
                            📋
                          </button>
                        </div>
                        
                        {vivaMode === 'study' ? (
                          !vivaExpanded.has(index) ? (
                            <button
                              onClick={() => onToggleVivaAnswer(index)}
                              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-all"
                            >
                              Show Answer
                            </button>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                  <h5 className="text-blue-400 font-medium mb-2">Answer:</h5>
                                  <p className="text-gray-300 whitespace-pre-wrap">{question.answer}</p>
                                </div>
                                <button
                                  onClick={() => onCopyToClipboard(question.answer, 'Answer')}
                                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 hover:text-white transition-all flex-shrink-0"
                                >
                                  📋
                                </button>
                              </div>
                              
                              {question.keyPoints && question.keyPoints.length > 0 && (
                                <div>
                                  <h5 className="text-purple-400 font-medium mb-2">Key Points:</h5>
                                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                                    {question.keyPoints.map((point, idx) => (
                                      <li key={idx}>{point}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {question.followUpQuestion && (
                                <div className="p-4 rounded-lg border-l-4 bg-gray-800 border-yellow-500">
                                  <h5 className="text-yellow-400 font-medium mb-2">Follow-Up Question:</h5>
                                  <p className="text-gray-200">{question.followUpQuestion}</p>
                                </div>
                              )}
                              
                              <button
                                onClick={() => onToggleVivaAnswer(index)}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-all"
                              >
                                Hide Answer
                              </button>
                            </div>
                          )
                        ) : (
                          !vivaExpanded.has(index) ? (
                            <button
                              onClick={() => onToggleVivaAnswer(index)}
                              className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg text-white transition-all"
                            >
                              Reveal Answer
                            </button>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                  <h5 className="text-blue-400 font-medium mb-2">Answer:</h5>
                                  <p className="text-gray-300 whitespace-pre-wrap">{question.answer}</p>
                                </div>
                                <button
                                  onClick={() => onCopyToClipboard(question.answer, 'Answer')}
                                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 hover:text-white transition-all flex-shrink-0"
                                >
                                  📋
                                </button>
                              </div>
                              
                              {question.keyPoints && question.keyPoints.length > 0 && (
                                <div>
                                  <h5 className="text-purple-400 font-medium mb-2">Key Points:</h5>
                                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                                    {question.keyPoints.map((point, idx) => (
                                      <li key={idx}>{point}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {question.followUpQuestion && (
                                <div className="p-4 rounded-lg border-l-4 bg-gray-800 border-yellow-500">
                                  <h5 className="text-yellow-400 font-medium mb-2">Follow-Up Question:</h5>
                                  <p className="text-gray-200">{question.followUpQuestion}</p>
                                </div>
                              )}
                              
                              <button
                                onClick={() => onToggleVivaAnswer(index)}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-all"
                              >
                                Hide Answer
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Back to Config Button */}
                  <div className="flex justify-center">
                    <button
                      onClick={onScrollToVivaConfig}
                      className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 rounded-lg font-medium transition-all flex items-center gap-2"
                    >
                      ↑ Back to Configuration
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function DebugSection({ extractedText, onTestAI, testLoading, testError, testResponse }) {
  return (
    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold mb-6">Debug Information</h3>
      <div className="space-y-6">
        {extractedText && (
          <>
            <div className="bg-gray-900 rounded-xl p-4">
              <div className="text-gray-400 text-sm mb-1">Character Count</div>
              <div className="text-2xl font-bold">{extractedText.length}</div>
            </div>
            <div className="bg-gray-900 rounded-xl p-4">
              <div className="text-gray-400 text-sm mb-2">First 500 Characters</div>
              <div className="font-mono text-sm text-gray-300 whitespace-pre-wrap">
                {extractedText.slice(0, 500)}
                {extractedText.length > 500 && '...'}
              </div>
            </div>
          </>
        )}
        
        <div className="bg-gray-900 rounded-xl p-4">
          <div className="text-gray-400 text-sm mb-2">Test AI API</div>
          <button
            onClick={onTestAI}
            disabled={testLoading}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center gap-2 mb-4"
          >
            {testLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Testing...
              </>
            ) : (
              'Test AI'
            )}
          </button>
          
          {testError && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400 mb-4">
              {testError}
            </div>
          )}
          
          {testResponse && (
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-2">Response:</div>
              <div className="text-gray-300 whitespace-pre-wrap">{testResponse}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
