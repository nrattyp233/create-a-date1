
import React, { useState, useEffect, useRef } from 'react';
import { Match, Message } from '../types';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import { getChatSuggestions } from '../services/geminiService';
import { persistence } from '../services/persistence';

const ChatWindow: React.FC<{ match: Match; onBack: () => void }> = ({ match, onBack }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState(match.chatHistory);
    const [newMessage, setNewMessage] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (newMessage.trim() === '' || !user) return;
        const msg: Message = {
            id: Math.random(),
            senderId: user.id,
            text: newMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        const sent = await persistence.sendMessage(match.id, user.id, newMessage);
        setMessages(prev => [...prev, sent]);
        setNewMessage('');
        setSuggestions([]);
    };

    const handleGetSuggestions = async () => {
        setLoadingSuggestions(true);
        const history = messages.map(m => `${m.senderId === user?.id ? 'Me' : match.user.name}: ${m.text}`).join('\n');
        const newSuggestions = await getChatSuggestions(history);
        setSuggestions(newSuggestions);
        setLoadingSuggestions(false);
    }
    
    return (
        <div className="h-full flex flex-col">
            <div className="p-4 flex items-center bg-gray-800/80 backdrop-blur-sm border-b border-gray-700">
                <button onClick={onBack} className="mr-4 text-white">←</button>
                <img src={match.user.photos[0]} className="w-10 h-10 rounded-full object-cover" />
                <h2 className="ml-3 text-xl font-bold">{match.user.name}</h2>
            </div>
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.senderId === user?.id ? 'bg-pink-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
                            <p>{msg.text}</p>
                            <span className="text-xs text-gray-400 mt-1 block text-right">{msg.timestamp}</span>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-gray-800/80 backdrop-blur-sm border-t border-gray-700">
                {suggestions.length > 0 && (
                     <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                        {suggestions.map((s, i) => (
                             <button key={i} onClick={() => setNewMessage(s)} className="text-sm bg-gray-600 px-3 py-1 rounded-full whitespace-nowrap hover:bg-pink-500 transition-colors">
                                 {s}
                             </button>
                        ))}
                     </div>
                )}
                <div className="flex items-center space-x-2">
                    <Button onClick={handleGetSuggestions} isLoading={loadingSuggestions} variant="secondary" size="sm" className="p-2 rounded-full">✨</Button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message..."
                        className="flex-grow bg-gray-700 text-white p-2 rounded-full px-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <Button onClick={handleSend} className="rounded-full !px-4">Send</Button>
                </div>
            </div>
        </div>
    )
}

const MatchesList: React.FC<{ onSelectMatch: (match: Match) => void }> = ({ onSelectMatch }) => {
    const { user } = useAuth();
    const [matches, setMatchesState] = useState<Match[]>([]);
    useEffect(() => {
        (async () => {
            if (!user) return;
            const ms = await persistence.matches(user.id);
            setMatchesState(ms);
        })();
    }, [user]);
    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-4">Matches</h1>
            <div className="space-y-2">
                {matches.map(match => (
                    <div key={match.id} onClick={() => onSelectMatch(match)} className="flex items-center p-3 bg-gray-800/70 rounded-lg cursor-pointer hover:bg-gray-700/70 transition-colors">
                        <img src={match.user.photos[0]} className="w-14 h-14 rounded-full object-cover" />
                        <div className="ml-4 flex-grow">
                            <div className="flex justify-between">
                                <h3 className="font-bold">{match.user.name}</h3>
                                <p className="text-xs text-gray-400">{match.timestamp}</p>
                            </div>
                            <p className={`text-sm ${match.unread ? 'text-white' : 'text-gray-400'}`}>{match.lastMessage}</p>
                        </div>
                        {match.unread && <div className="w-3 h-3 bg-pink-500 rounded-full ml-3"></div>}
                    </div>
                ))}
            </div>
        </div>
    )
}

const MatchesPage: React.FC = () => {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  
  return (
    <div className="h-full">
      {selectedMatch ? (
        <ChatWindow match={selectedMatch} onBack={() => setSelectedMatch(null)} />
      ) : (
        <MatchesList onSelectMatch={setSelectedMatch} />
      )}
    </div>
  );
};

export default MatchesPage;
