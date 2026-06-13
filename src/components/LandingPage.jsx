import React from 'react'

function LandingPage({ onGetStarted }) {
  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 w-full border-b border-gray-800 bg-gray-900/80 backdrop-blur z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">SL</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                SmartLearn AI
              </span>
            </div>
            <button
              onClick={onGetStarted}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Transform Your Study Material
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
              Upload your notes and let AI generate summaries, revision notes, quizzes, and exam questions in seconds
            </p>
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold text-lg transition-all shadow-xl hover:shadow-2xl"
            >
              Start Learning Now
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              { icon: '📝', title: 'AI Summary', desc: 'Get concise, intelligent summaries of your study material' },
              { icon: '📚', title: 'Revision Notes', desc: 'Well-structured notes for quick revision before exams' },
              { icon: '🎯', title: 'MCQ Quiz', desc: 'Test your knowledge with AI-generated multiple-choice questions' },
              { icon: '✍️', title: 'Exam Questions', desc: 'Practice with exam-style questions tailored to your material' },
              { icon: '🎤', title: 'Viva Questions', desc: 'Prepare for oral exams with relevant viva questions' },
              { icon: '📊', title: 'Progress Tracking', desc: 'Monitor your learning journey and track your progress' },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700 hover:border-blue-500/50 transition-all hover:shadow-xl"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-6">
                  <span className="text-3xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default LandingPage
