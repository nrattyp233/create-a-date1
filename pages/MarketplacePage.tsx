
import React, { useEffect, useState } from 'react';
import { DateIdea, User } from '../types';
import { CURRENT_USER } from '../constants';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { generateDateIdea } from '../services/geminiService';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/ui/Spinner';
import { persistence } from '../services/persistence';

const DateCreator: React.FC<{onClose: () => void, addDateIdea: (idea: DateIdea) => void}> = ({onClose, addDateIdea}) => {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateIdea = async () => {
        if(!user) return;
        setIsLoading(true);
        const idea = await generateDateIdea(user.interests);
        setTitle(idea.title);
        setDescription(idea.description);
        setLocation(idea.location);
        setIsLoading(false);
    };

    const handleSubmit = () => {
        if(title && description && location && user){
            const newIdea: DateIdea = {
                id: Math.random(),
                creator: user,
                title,
                description,
                location,
                applicants: []
            };
            addDateIdea(newIdea);
            onClose();
        }
    }

    return (
        <div className="space-y-4">
             <Button onClick={handleGenerateIdea} isLoading={isLoading} className="w-full" variant="secondary">
                ✨ Generate with AI
            </Button>
            <input type="text" placeholder="Date Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:ring-pink-500 focus:border-pink-500" />
            <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:ring-pink-500 focus:border-pink-500" />
            <input type="text" placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:ring-pink-500 focus:border-pink-500" />
            <Button onClick={handleSubmit} className="w-full">Post Date Idea</Button>
        </div>
    )
}

const DateCard: React.FC<{idea: DateIdea, onSelect: () => void}> = ({idea, onSelect}) => (
    <Card className="p-4" onClick={onSelect}>
        <div className="flex items-start space-x-4">
            <img src={idea.creator.photos[0]} alt={idea.creator.name} className="w-12 h-12 rounded-full object-cover" />
            <div>
                <h3 className="font-bold text-lg text-pink-400">{idea.title}</h3>
                <p className="text-sm text-gray-300">Posted by {idea.creator.name}</p>
                <p className="mt-2 text-gray-200">{idea.description}</p>
            </div>
        </div>
    </Card>
)

const DateDetails: React.FC<{idea: DateIdea | null, onClose: () => void}> = ({ idea, onClose}) => {
    const { user } = useAuth();
    if(!idea) return null;

    const isCreator = user?.id === idea.creator.id;

    return (
        <Modal isOpen={!!idea} onClose={onClose} title={idea.title}>
            <div>
                <div className="flex items-center space-x-3 mb-4">
                    <img src={idea.creator.photos[0]} alt={idea.creator.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                        <p className="font-semibold">{idea.creator.name}</p>
                        <p className="text-sm text-gray-400">{idea.location}</p>
                    </div>
                </div>
                <p className="text-gray-300 mb-6">{idea.description}</p>
                
                {isCreator ? (
                    <div>
                        <h4 className="font-bold text-lg mb-2">Applicants ({idea.applicants.length})</h4>
                        {idea.applicants.length > 0 ? (
                        <div className="space-y-3">
                            {idea.applicants.map(applicant => (
                                <div key={applicant.id} className="flex items-center justify-between bg-gray-700 p-2 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <img src={applicant.photos[0]} alt={applicant.name} className="w-10 h-10 rounded-full object-cover"/>
                                        <span className="font-semibold">{applicant.name}</span>
                                    </div>
                                    <Button size="sm">Match!</Button>
                                </div>
                            ))}
                        </div>
                        ) : <p className="text-gray-400">No applicants yet.</p>}
                    </div>
                ) : (
                     <Button className="w-full">I'm Interested!</Button>
                )}

            </div>
        </Modal>
    )
}


const MarketplacePage: React.FC = () => {
    const [dateIdeas, setDateIdeas] = useState<DateIdea[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedIdea, setSelectedIdea] = useState<DateIdea | null>(null);

    const addDateIdea = async (idea: DateIdea) => {
        await persistence.addDateIdea(idea);
        setDateIdeas(prev => [idea, ...prev]);
    }

    useEffect(() => {
        (async () => {
            const list = await persistence.getDateIdeas();
            setDateIdeas(list);
        })();
    }, []);

  return (
    <div className="p-4">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Date Marketplace</h1>
            <Button onClick={() => setIsCreating(true)}>Post a Date</Button>
        </div>
        
        <div className="space-y-4">
            {dateIdeas.map(idea => (
                <DateCard key={idea.id} idea={idea} onSelect={() => setSelectedIdea(idea)} />
            ))}
        </div>

        <Modal isOpen={isCreating} onClose={() => setIsCreating(false)} title="Create a New Date Idea">
            <DateCreator onClose={() => setIsCreating(false)} addDateIdea={addDateIdea}/>
        </Modal>
        
        <DateDetails idea={selectedIdea} onClose={() => setSelectedIdea(null)} />
    </div>
  );
};

export default MarketplacePage;
