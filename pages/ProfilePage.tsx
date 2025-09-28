
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { getProfileFeedback, generateBackgroundImage } from '../services/geminiService';
import Spinner from '../components/ui/Spinner';

const ProfileEditor: React.FC<{onClose: () => void}> = ({ onClose }) => {
    const { user, updateUser } = useAuth();
    const [bio, setBio] = useState(user?.bio || '');
    const [feedback, setFeedback] = useState<{ feedback: string; vibe: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAnalyze = async () => {
        setIsLoading(true);
        const result = await getProfileFeedback(bio);
        setFeedback(result);
        setIsLoading(false);
    };
    
    const handleSave = () => {
        updateUser({ bio });
        if(feedback?.vibe) {
            updateUser({ vibe: feedback.vibe });
        }
        onClose();
    };

    return (
        <div className="space-y-4">
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={5} className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600" />
            <Button onClick={handleAnalyze} isLoading={isLoading} variant="secondary" className="w-full">✨ Get AI Feedback</Button>
            {feedback && (
                <Card className="p-4 bg-gray-900">
                    <p className="font-bold text-pink-400">Suggested Vibe: <span className="text-white">{feedback.vibe}</span></p>
                    <p className="mt-2 text-gray-300">{feedback.feedback}</p>
                </Card>
            )}
            <Button onClick={handleSave} className="w-full">Save Profile</Button>
        </div>
    )
}

const BackgroundGenerator: React.FC<{onClose: () => void}> = ({ onClose }) => {
    const { setBackgroundImage } = useAuth();
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const handleGenerate = async () => {
        if (!prompt) return;
        setIsLoading(true);
        const imageUrl = await generateBackgroundImage(prompt);
        if (imageUrl) {
            setBackgroundImage(imageUrl);
        }
        setIsLoading(false);
        onClose();
    };

    return (
        <div className="space-y-4">
             <input type="text" placeholder="e.g., 'cosmic love', 'neon city rain'" value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600" />
             <Button onClick={handleGenerate} isLoading={isLoading} className="w-full">Generate Background</Button>
        </div>
    )
}

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingBg, setIsGeneratingBg] = useState(false);

  if (!user) return <Spinner />;

  return (
    <div className="p-4">
      <div className="flex flex-col items-center">
        <img src={user.photos[0]} alt={user.name} className="w-32 h-32 rounded-full object-cover border-4 border-pink-500" />
        <h1 className="text-3xl font-bold mt-4">{user.name}, {user.age}</h1>
        <p className="text-lg text-pink-400 italic">"{user.vibe}"</p>
        <Card className="w-full p-4 mt-4 text-center">
            <p className="text-gray-300">{user.bio}</p>
        </Card>
        <div className="w-full mt-4 flex flex-wrap justify-center gap-2">
            {user.interests.map(interest => (
                <span key={interest} className="bg-gray-700 text-white text-sm font-semibold px-3 py-1 rounded-full">{interest}</span>
            ))}
        </div>
      </div>
      
      <div className="mt-6 space-y-4">
        <Button onClick={() => setIsEditing(true)} variant="secondary" className="w-full">Edit Profile & Get AI Tips</Button>
        <Button onClick={() => setIsGeneratingBg(true)} variant="secondary" className="w-full">🎨 AI Background Generator</Button>
        <Card className="p-4 text-center">
            <h3 className="text-xl font-bold text-yellow-400">Go Premium!</h3>
            <p className="text-gray-300 mt-2">Unlock unlimited AI features, see who likes you, and undo swipes.</p>
            <Button className="mt-4">Upgrade Now</Button>
        </Card>
        <Button onClick={logout} variant="danger" className="w-full">Logout</Button>
      </div>

      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Edit Your Profile">
          <ProfileEditor onClose={() => setIsEditing(false)} />
      </Modal>

      <Modal isOpen={isGeneratingBg} onClose={() => setIsGeneratingBg(false)} title="Generate AI Background">
          <BackgroundGenerator onClose={() => setIsGeneratingBg(false)} />
      </Modal>
    </div>
  );
};

export default ProfilePage;
