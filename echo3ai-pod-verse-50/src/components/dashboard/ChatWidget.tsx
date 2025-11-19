
import React, { useState } from 'react';
import { X, MessageCircle, Send, Loader2 } from 'lucide-react';
import { Rnd } from 'react-rnd';

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  podcast: {
    _id: string;
    id: number;
    title: string;
    creator: string;
    guest: string;
  };
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ isOpen, onClose, podcast }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{
    id: number;
    sender: string;
    content: string;
    timestamp: string;
  }>>([]);
  const [transcript, setTranscript] = useState<string>('');
  const [creator, setCreator] = useState<string>('');
  const [guest, setGuest] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize chat with transcript
  React.useEffect(() => {
    if (isOpen && !isInitialized) {
      initializeChat();
    }
  }, [isOpen, isInitialized]);

  const initializeChat = async () => {
    try {
      setIsLoading(true);
      
      // Fetch transcript from MongoDB
      const response = await fetch(`https://echo3ai-updated-3.onrender.com /api/podcasts/${podcast._id}/transcript`);
      const result = await response.json();
      
      if (result.success) {
        setTranscript(result.transcript);
        setCreator(result.creator || '');
        setGuest(result.guest || '');
        
        // Create a personalized welcome message
        const welcomeMessage = result.transcript 
          ? `Hi! I'm Echo3AI, your podcast assistant. I'm here to chat about "${podcast.title}" with ${result.creator || 'the host'}${result.guest ? ` and ${result.guest}` : ''}. I have access to the full transcript and can answer any questions you have about this episode. What would you like to know?`
          : `Hi! I'm Echo3AI, your podcast assistant. I'm here to chat about "${podcast.title}" with ${result.creator || 'the host'}${result.guest ? ` and ${result.guest}` : ''}. Unfortunately, no transcript is available for this podcast yet.`;
        
        setMessages([
          {
            id: 1,
            sender: 'Echo3AI',
            content: welcomeMessage,
            timestamp: new Date().toLocaleTimeString(),
          }
        ]);
      } else {
        setMessages([
          {
            id: 1,
            sender: 'Echo3AI',
            content: `Hi! I'm Echo3AI, your podcast assistant. I'm here to chat about "${podcast.title}" with ${result.creator || 'the host'}${result.guest ? ` and ${result.guest}` : ''}. Unfortunately, I couldn't load the transcript for this podcast.`,
            timestamp: new Date().toLocaleTimeString(),
          }
        ]);
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      setMessages([
        {
          id: 1,
          sender: 'Echo3AI',
          content: `Hi! I'm Echo3AI, your podcast assistant. I'm here to chat about "${podcast.title}" with ${podcast.creator || 'the host'}${podcast.guest ? ` and ${podcast.guest}` : ''}. Sorry, I'm having trouble loading the transcript right now.`,
          timestamp: new Date().toLocaleTimeString(),
        }
      ]);
      setIsInitialized(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && transcript) {
      const userMessage = {
        id: messages.length + 1,
        sender: 'You',
        content: message,
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      const currentMessage = message;
      setMessage('');
      setIsLoading(true);
      
      try {
        // Send to chat API
        const response = await fetch('https://echo3ai-updated-3.onrender.com /api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
                  body: JSON.stringify({
          transcript: transcript,
          question: currentMessage,
          creator: creator,
          guest: guest
        }),
        });

        const result = await response.json();
        
        if (result.success) {
          const aiResponse = {
            id: messages.length + 2,
            sender: 'Echo3AI',
            content: result.answer,
            timestamp: new Date().toLocaleTimeString(),
          };
          setMessages(prev => [...prev, aiResponse]);
        } else {
          const errorResponse = {
            id: messages.length + 2,
            sender: 'Echo3AI',
            content: `Sorry, I encountered an error: ${result.error}`,
            timestamp: new Date().toLocaleTimeString(),
          };
          setMessages(prev => [...prev, errorResponse]);
        }
      } catch (error) {
        console.error('Chat error:', error);
        const errorResponse = {
          id: messages.length + 2,
          sender: 'Echo3AI',
          content: 'Sorry, I\'m having trouble responding right now. Please try again later.',
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages(prev => [...prev, errorResponse]);
      } finally {
        setIsLoading(false);
      }
    } else if (message.trim() && !transcript) {
      // Handle case when no transcript is available
      const userMessage = {
        id: messages.length + 1,
        sender: 'You',
        content: message,
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      setMessage('');
      
      const noTranscriptResponse = {
        id: messages.length + 2,
        sender: 'Echo3AI',
        content: 'I don\'t have access to the transcript for this podcast, so I can\'t answer specific questions about its content. Please try again when a transcript is available.',
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, noTranscriptResponse]);
    }
  };

  // Reset chat when closed
  React.useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setTranscript('');
      setCreator('');
      setGuest('');
      setIsInitialized(false);
      setIsLoading(false);
    }
  }, [isOpen]);

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
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800/60 text-white rounded-2xl rounded-bl-md px-3 py-2">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Echo3AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
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
