
import React, { useState, useRef, useEffect } from 'react';
import { getBotResponse } from '../services/geminiService';
import { BotIcon, UserIcon, SendIcon, LogoIcon } from './icons';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  suggestions?: string[];
}

const QUICK_SERVICES = [
  { label: '🏠 Cổng DVC Quốc gia', url: 'https://dichvucong.gov.vn/' },
  { label: '🏙️ Cổng DVC Hà Nội', url: 'https://dichvucong.hanoi.gov.vn/' },
  { label: '👶 Khai sinh', url: 'https://dichvucong.gov.vn/p/home/dvc-danh-muc-dich-vu-cong.html?search=khai+sinh' },
  { label: '💍 Kết hôn', url: 'https://dichvucong.gov.vn/p/home/dvc-danh-muc-dich-vu-cong.html?search=k%E1%BA%BFt+h%C3%B4n' },
  { label: '📝 Tạm trú/Tạm vắng', url: 'https://dichvucong.gov.vn/p/home/dvc-danh-muc-dich-vu-cong.html?search=t%E1%BA%A1m+tr%C3%BA' },
  { label: '🛂 Hộ chiếu', url: 'https://dichvucong.gov.vn/p/home/dvc-danh-muc-dich-vu-cong.html?search=h%E1%BB%99+chi%E1%BA%BFu' },
  { label: '🚗 Nộp phạt Giao thông', url: 'https://dichvucong.gov.vn/p/home/dvc-thanh-toan-vi-pham-giao-thong.html' },
  { label: '🔍 Tra cứu hồ sơ', url: 'https://dichvucong.gov.vn/p/home/dvc-tra-cuu-ho-so.html' },
];

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: 'Xin chào! Tôi là Phương Liệt Chatbot, trợ lý AI của bạn. Tôi có thể giúp gì cho bạn về các dịch vụ công trực tuyến hoặc ứng dụng iHanoi?',
      suggestions: ['Hướng dẫn nộp hồ sơ', 'Ứng dụng iHanoi', 'Liên hệ Tổ hỗ trợ'],
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const parseBotResponse = (responseText: string) => {
    const suggestionRegex = /\[SUGGESTIONS:\s*(.*?)\]/i;
    const match = responseText.match(suggestionRegex);
    
    let text = responseText;
    let suggestions: string[] = [];

    if (match) {
      text = responseText.replace(match[0], '').trim();
      suggestions = match[1].split(',').map(s => s.trim()).filter(s => s.length > 0);
    }

    return { text, suggestions };
  };

  const processUserQuery = async (query: string) => {
    if (query.trim() === '' || isLoading) return;

    const userMessage: Message = { sender: 'user', text: query };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const botRawResponse = await getBotResponse(query);
      const { text, suggestions } = parseBotResponse(botRawResponse);
      const botMessage: Message = { sender: 'bot', text, suggestions };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting bot response:', error);
      const errorMessage: Message = {
        sender: 'bot',
        text: 'Rất tiếc, đã có lỗi xảy ra. Vui lòng thử lại sau.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    processUserQuery(input);
  };

  const handleSuggestionClick = (suggestion: string) => {
    processUserQuery(suggestion);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="flex items-center p-4 bg-white border-b border-gray-100 shadow-sm z-10">
        <LogoIcon className="h-10 w-10 text-blue-600" />
        <div className="ml-3">
          <h1 className="text-xl font-bold text-gray-800">Phương Liệt Chatbot</h1>
          <div className="text-xs text-green-500 flex items-center font-medium">
            <span className="h-2 w-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
            Sẵn sàng hỗ trợ
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">
        {messages.map((msg, index) => (
          <div key={index} className="space-y-3">
            <div
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'bot' && <BotIcon className="w-8 h-8 flex-shrink-0 shadow-sm" />}
              <div
                className={`max-w-[85%] md:max-w-md lg:max-w-2xl rounded-2xl p-4 text-sm shadow-sm whitespace-pre-wrap leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
              {msg.sender === 'user' && <UserIcon className="w-8 h-8 flex-shrink-0 shadow-sm" />}
            </div>
            
            {msg.sender === 'bot' && msg.suggestions && msg.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 pl-11">
                {msg.suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(s)}
                    className="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-xs font-medium transition-all shadow-sm transform active:scale-95"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3 justify-start">
            <BotIcon className="w-8 h-8 flex-shrink-0 shadow-sm" />
            <div className="bg-white border border-gray-100 text-gray-800 rounded-2xl p-4 rounded-bl-none shadow-sm">
              <div className="flex items-center justify-center space-x-1.5">
                <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      <div className="px-4 pt-4 pb-2 bg-white border-t border-gray-100 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 whitespace-nowrap pb-2">
          {QUICK_SERVICES.map((service, idx) => (
            <a
              key={idx}
              href={service.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-full border border-blue-100 transition-colors duration-200"
            >
              {service.label}
            </a>
          ))}
        </div>
      </div>

      <footer className="p-4 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Bạn cần hỗ trợ thủ tục gì hôm nay?"
            className="flex-1 w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center hover:bg-blue-700 hover:shadow-blue-300 transform active:scale-95 transition-all disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
            disabled={isLoading || input.trim() === ''}
            title="Gửi tin nhắn"
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </form>
        <p className="text-[10px] text-center text-gray-400 mt-3 font-medium">
          Hỗ trợ bởi Tổ Chuyển đổi số Cộng đồng Phường Phương Liệt
        </p>
      </footer>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Chatbot;
