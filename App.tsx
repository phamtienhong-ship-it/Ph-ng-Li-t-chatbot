
import React from 'react';
import Chatbot from './components/Chatbot';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-blue-200 flex flex-col items-center justify-center p-2 sm:p-4 font-sans">
        <div className="w-full max-w-4xl h-[95vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <Chatbot />
        </div>
    </div>
  );
};

export default App;
