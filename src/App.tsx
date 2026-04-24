import { useState } from 'react';
import { Moon, Sun, MessageSquare, BookOpen, Layers } from 'lucide-react';
import LiveTutor, { Message } from './components/LiveTutor';
import MCQGenerator from './components/MCQGenerator';
import FlashcardsGenerator from './components/FlashcardsGenerator';

type Tab = 'tutor' | 'mcq' | 'flashcards';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('tutor');

  // Persistent LiveTutor session
  const [liveTutorState, setLiveTutorState] = useState({
    file: null as File | null,
    messages: [] as Message[],
    lectureText: '',
  });

  // Comment button state
  const [showComment, setShowComment] = useState(false);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#0D1117] text-white' : 'bg-[#F5F5F5] text-gray-900'}`}>
      {/* HEADER */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors ${darkMode ? 'bg-[#0D1117]/80 border-gray-800' : 'bg-white/80 border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00FFC6] to-[#8A2BE2] flex items-center justify-center">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#00FFC6] to-[#8A2BE2] bg-clip-text text-transparent">
                MemoriaMD
              </h1>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-5 h-5 text-[#00FFC6]" /> : <Moon className="w-5 h-5 text-[#8A2BE2]" />}
            </button>
          </div>
        </div>
      </header>

      {/* TABS */}
      <nav className={`border-b transition-colors ${darkMode ? 'bg-[#161B22] border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto">
            <TabButton
              icon={<MessageSquare className="w-5 h-5" />}
              label="Live Tutor"
              active={activeTab === 'tutor'}
              onClick={() => setActiveTab('tutor')}
              darkMode={darkMode}
            />
            <TabButton
              icon={<BookOpen className="w-5 h-5" />}
              label="MCQ Generator"
              active={activeTab === 'mcq'}
              onClick={() => setActiveTab('mcq')}
              darkMode={darkMode}
            />
            <TabButton
              icon={<Layers className="w-5 h-5" />}
              label="Flashcards"
              active={activeTab === 'flashcards'}
              onClick={() => setActiveTab('flashcards')}
              darkMode={darkMode}
            />
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className={activeTab === 'tutor' ? '' : 'hidden'}>
          <LiveTutor
            darkMode={darkMode}
            file={liveTutorState.file}
            messages={liveTutorState.messages}
            lectureText={liveTutorState.lectureText}
            setLiveTutorState={setLiveTutorState}
          />
        </div>

        <div className={activeTab === 'mcq' ? '' : 'hidden'}>
          <MCQGenerator darkMode={darkMode} />
        </div>

        <div className={activeTab === 'flashcards' ? '' : 'hidden'}>
          <FlashcardsGenerator darkMode={darkMode} />
        </div>
      </main>

{/* COMMENT BUTTON */}
<div className="mt-8 flex flex-col items-center space-y-2">
  <button
    onClick={() => setShowComment(!showComment)}
    className="px-3 py-1 border-2 border-[#00FFC6] text-[#00FFC6] rounded-full text-sm font-medium hover:bg-[#00FFC620] transition-colors duration-200"
  >
    Have a comment?
  </button>

  <div
    className={`px-4 py-2 rounded-lg bg-gray-800 text-white shadow-lg text-sm transform transition-all duration-300 ${
      showComment ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
    }`}
  >
    Seif Ata | s.mousa0875@student.aast.edu
  </div>
</div>


      {/* FOOTER */}
      <footer className={`mt-auto border-t transition-colors ${darkMode ? 'bg-[#161B22] border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm opacity-60">
            Your gate to Innovative learning
          </p>
        </div>
      </footer>
    </div>
  );
}

function TabButton({ icon, label, active, onClick, darkMode }: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  darkMode: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-all duration-300 whitespace-nowrap ${
        active
          ? 'border-[#00FFC6] text-[#00FFC6]'
          : darkMode
          ? 'border-transparent text-gray-400 hover:text-gray-300'
          : 'border-transparent text-gray-600 hover:text-gray-900'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

export default App;
