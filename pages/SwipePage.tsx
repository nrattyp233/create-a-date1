
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import ProfileCard from '../components/ProfileCard';
import { XMarkIcon, HeartIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/solid';
import { persistence } from '../services/persistence';

const SwipePage: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [lastSwiped, setLastSwiped] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const feed = await persistence.feed(user.id);
      setUsers(feed);
    })();
  }, [user]);

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!user || users.length === 0) return;
    const swipedUser = users[0];
    await persistence.swipe(user.id, swipedUser.id, direction);
    setLastSwiped({ user: swipedUser, direction });
    setUsers(prevUsers => prevUsers.slice(1));
  };

  const handleUndo = () => {
    if(lastSwiped){
       // This is a premium feature
       alert("Undo last swipe is a premium feature!");
       // In a real app with premium state:
       // setUsers(prevUsers => [lastSwiped.user, ...prevUsers]);
       // setLastSwiped(null);
    }
  };

  return (
    <div className="flex flex-col h-full items-center p-4">
      <div className="flex-grow w-full max-w-sm flex items-center justify-center">
        {users.length > 0 ? (
          <div className="w-full aspect-[9/16]">
            <ProfileCard user={users[0]} />
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">No more profiles</h2>
            <p className="text-gray-400 mt-2">Check back later for new people!</p>
          </div>
        )}
      </div>

      <div className="flex justify-around items-center w-full max-w-sm mt-6">
        <button onClick={() => handleSwipe('left')} className="p-4 bg-white/10 rounded-full text-red-500 hover:bg-white/20 transition-all">
          <XMarkIcon className="h-8 w-8" />
        </button>
        <button onClick={handleUndo} className="p-3 bg-white/10 rounded-full text-yellow-500 hover:bg-white/20 transition-all disabled:opacity-50" disabled={!lastSwiped}>
          <ArrowUturnLeftIcon className="h-6 w-6" />
        </button>
        <button onClick={() => handleSwipe('right')} className="p-4 bg-white/10 rounded-full text-green-400 hover:bg-white/20 transition-all">
          <HeartIcon className="h-8 w-8" />
        </button>
      </div>
    </div>
  );
};

export default SwipePage;
