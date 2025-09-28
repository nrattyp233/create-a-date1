
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { getCompatibility } from '../services/geminiService';
import { useAuth } from '../hooks/useAuth';
import Spinner from './ui/Spinner';

interface ProfileCardProps {
  user: User;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
  const { user: currentUser } = useAuth();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [compatibility, setCompatibility] = useState<{ vibe: string; score: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompatibility = async () => {
      if (currentUser) {
        setLoading(true);
        const result = await getCompatibility(currentUser.bio, user.bio);
        setCompatibility(result);
        setLoading(false);
      }
    };
    fetchCompatibility();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentUser]);

  const nextPhoto = () => {
    setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % user.photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prevIndex) => (prevIndex - 1 + user.photos.length) % user.photos.length);
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-gray-800 flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-full">
        <img src={user.photos[currentPhotoIndex]} alt={user.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
      </div>

      <div className="absolute top-2 left-0 right-0 flex justify-center space-x-1 px-4">
        {user.photos.map((_, index) => (
          <div key={index} className={`h-1 flex-1 rounded-full ${index === currentPhotoIndex ? 'bg-white' : 'bg-white/30'}`} />
        ))}
      </div>

      <div className="absolute inset-0 flex">
        <div className="w-1/3 h-full" onClick={prevPhoto}></div>
        <div className="w-1/3 h-full"></div>
        <div className="w-1/3 h-full" onClick={nextPhoto}></div>
      </div>
      
      <div className="relative mt-auto p-4 text-white z-10">
        <h1 className="text-3xl font-bold">{user.name}, {user.age}</h1>
        <p className="mt-2 text-gray-200">{user.bio}</p>
        
        <div className="mt-4">
          <h3 className="font-semibold text-pink-400">Vibe Check & Compatibility</h3>
          {loading ? <Spinner size="sm" /> :
          (
            <div className="flex items-center space-x-4 mt-2">
              <div className="text-center">
                  <div className={`radial-progress bg-gray-700 text-green-400 border-4 border-gray-700`} style={{ "--value": compatibility?.score || 0, "--size": "3.5rem", "--thickness": "4px" } as React.CSSProperties}>
                      <span className="font-bold text-sm">{compatibility?.score}%</span>
                  </div>
              </div>
              <p className="text-lg italic text-gray-300">"{compatibility?.vibe}"</p>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
            {user.interests.slice(0, 5).map(interest => (
                <span key={interest} className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">{interest}</span>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
