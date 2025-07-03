
import React, { useState } from 'react';
import { X, MessageCircle, Send } from 'lucide-react';
import { Rnd } from 'react-rnd';

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  podcast: {
    id: number;
    title: string;
    creator: string;
  };
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ isOpen, onClose, podcast }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'Echo3AI',
      content: `Hi! I'm here to chat about "${podcast.title}". What would you like to know?`,
      timestamp: new Date().toLocaleTimeString(),
    }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: 'You',
        content: message,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages([...messages, newMessage]);
      setMessage('');
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse = {
          id: messages.length + 2,
          sender: 'Echo3AI',
          content: 'That\'s a great question! Let me analyze that episode segment for you...',
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <Rnd
        default={{
          x: window.innerWidth - 380,
          y: 100,
          width: 350,
          height: 500,
        }}
        minWidth={300}
        minHeight={400}
        maxWidth={600}
        maxHeight={800}
        bounds="window"
        dragHandleClassName="chat-drag-handle"
        className="pointer-events-auto"
      >
        <div className="w-full h-full bg-black/95 backdrop-blur-md border border-teal-400/50 rounded-2xl shadow-2xl shadow-teal-400/20 flex flex-col">
          {/* Header */}
          <div className="chat-drag-handle flex items-center justify-between p-4 border-b border-teal-400/30 cursor-move bg-gradient-to-r from-gray-900 to-gray-800 rounded-t-2xl">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-teal-400" />
              <div>
                <h3 className="text-white font-semibold text-sm">{podcast.title}</h3>
                <p className="text-gray-400 text-xs">Chat with Echo3AI</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors duration-200 hover:bg-white/10 rounded-full p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs px-3 py-2 rounded-2xl ${
                  msg.sender === 'You' 
                    ? 'bg-teal-600 text-white rounded-br-md' 
                    : 'bg-gray-800/60 text-white rounded-bl-md'
                }`}>
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-teal-400/30">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about this podcast..."
                className="flex-1 bg-gray-800/60 text-white placeholder-gray-400 border border-gray-600 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-teal-400 transition-colors duration-200"
              />
              <button
                type="submit"
                disabled={!message.trim()}
                className="w-10 h-10 bg-teal-400 hover:bg-teal-300 disabled:bg-gray-600 rounded-full flex items-center justify-center transition-colors duration-200 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 text-black" />
              </button>
            </div>
          </form>

          {/* Resize Handle */}
          <div className="absolute bottom-2 right-2 w-4 h-4 bg-teal-400/30 cursor-se-resize"></div>
        </div>
      </Rnd>
    </div>
  );
};

export default ChatWidget;
