import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { MessageCircle, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatWidget = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user && user.role === 'Patient') {
      socketRef.current = io('http://localhost:5000');
      
      socketRef.current.on('connect', () => {
        socketRef.current.emit('join_chat', user._id);
      });

      socketRef.current.on('receive_message', (msg) => {
        setMessages((prev) => [...prev, msg]);
      });

      return () => {
        socketRef.current.disconnect();
      };
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (input.trim() && socketRef.current) {
      const msg = {
        room: user._id,
        sender: user._id,
        content: input,
        role: 'Patient',
        timestamp: new Date().toISOString()
      };
      socketRef.current.emit('send_message', msg);
      setMessages((prev) => [...prev, msg]);
      setInput('');
    }
  };

  if (!user || user.role !== 'Patient') return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 mb-4"
            style={{ width: '320px', height: '400px' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-cyan-700 text-white p-4 flex justify-between items-center">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageCircle size={18} />
                Live Reception Desk
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-teal-100 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-3">
              {messages.length === 0 ? (
                <div className="text-center text-slate-400 text-sm mt-4">
                  Send a message to reception.
                </div>
              ) : (
                messages.map((m, idx) => {
                  const isMe = m.role === 'Patient';
                  return (
                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-lg p-2.5 text-sm ${
                        isMe ? 'bg-teal-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                      }`}>
                        {m.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border border-slate-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
              <button 
                type="submit" 
                disabled={!input.trim()}
                className="bg-teal-600 text-white p-2 rounded-full hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-teal-600 to-cyan-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <MessageCircle size={24} />
        </motion.button>
      )}
    </div>
  );
};

export default ChatWidget;
