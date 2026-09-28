import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { MessageCircle, Send, User } from 'lucide-react';

const ReceptionInbox = ({ receptionistId }) => {
  const [activeSessions, setActiveSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState('');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socketRef.current = io('http://localhost:5000');
    
    socketRef.current.on('connect', () => {
      // Receptionist might listen on a general namespace or rooms they joined
      // For now, any patient message goes to room = patientId. 
      // If the backend broadcasts a "patient_joined" or similar, we can listen to it.
      // Assuming a simplistic approach where receptionist joins when knowing the ID, 
      // or the backend broadcasts to a 'reception' room.
      socketRef.current.emit('join_chat', 'reception_inbox');
    });

    socketRef.current.on('receive_message', (msg) => {
      // A new message received
      const roomId = msg.room;
      
      setMessages(prev => {
        const roomMessages = prev[roomId] || [];
        return { ...prev, [roomId]: [...roomMessages, msg] };
      });

      if (msg.role === 'Patient') {
        setActiveSessions(prev => {
          if (!prev.includes(roomId)) {
            return [...prev, roomId];
          }
          return prev;
        });
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentSession]);

  const joinSession = (patientId) => {
    setCurrentSession(patientId);
    socketRef.current.emit('join_chat', patientId);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (input.trim() && currentSession && socketRef.current) {
      const msg = {
        room: currentSession,
        sender: receptionistId,
        content: input,
        role: 'Receptionist',
        timestamp: new Date().toISOString()
      };
      socketRef.current.emit('send_message', msg);
      
      setMessages(prev => {
        const roomMessages = prev[currentSession] || [];
        return { ...prev, [currentSession]: [...roomMessages, msg] };
      });
      setInput('');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex h-[500px]">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-slate-200 bg-slate-50 flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <MessageCircle size={18} className="text-teal-600" />
            Live Chats
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {activeSessions.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-400">No active chats</div>
          ) : (
            activeSessions.map(id => (
              <button
                key={id}
                onClick={() => joinSession(id)}
                className={`w-full text-left p-4 border-b border-slate-100 hover:bg-slate-100 transition-colors flex items-center gap-3 ${currentSession === id ? 'bg-teal-50 border-l-4 border-l-teal-600' : ''}`}
              >
                <div className="bg-teal-100 text-teal-700 p-2 rounded-full">
                  <User size={16} />
                </div>
                <div className="truncate">
                  <p className="text-sm font-medium text-slate-800 truncate">Patient {id.substring(0,6)}...</p>
                  <p className="text-xs text-slate-500">Click to view chat</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {currentSession ? (
          <>
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
              <h4 className="font-medium text-slate-800">Chat with Patient {currentSession.substring(0,6)}</h4>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-3">
              {(messages[currentSession] || []).map((m, idx) => {
                const isMe = m.role === 'Receptionist';
                return (
                  <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-lg p-2.5 text-sm ${
                      isMe ? 'bg-teal-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="p-4 bg-white border-t border-slate-200 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your reply..."
                className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
              <button 
                type="submit" 
                disabled={!input.trim()}
                className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                <span>Send</span>
                <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <MessageCircle size={48} className="mb-4 text-slate-200" />
            <p>Select a chat session to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceptionInbox;
