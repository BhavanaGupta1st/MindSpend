
import React from 'react';
import { MOCK_CHALLENGES } from '../services/mockData';
import { Challenge } from '../types';
import { TrophyIcon } from '../components/Icons';

const Challenges: React.FC = () => {
    const activeChallenges = MOCK_CHALLENGES.filter(c => !c.isCompleted);
    const completedChallenges = MOCK_CHALLENGES.filter(c => c.isCompleted);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Active Challenges</h1>
                <p className="text-gray-400">Stay motivated and build healthy financial habits.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {activeChallenges.map(challenge => (
                        <ChallengeCard key={challenge.id} challenge={challenge} />
                    ))}
                </div>
            </div>
             <div>
                <h1 className="text-3xl font-bold mb-2">Completed Challenges</h1>
                <p className="text-gray-400">Look at what you've accomplished!</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {completedChallenges.map(challenge => (
                        <ChallengeCard key={challenge.id} challenge={challenge} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const ChallengeCard: React.FC<{ challenge: Challenge }> = ({ challenge }) => {
    const progressPercentage = (challenge.progress / challenge.goal) * 100;
    return (
        <div className={`bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col ${challenge.isCompleted ? 'opacity-60' : ''}`}>
            <div className="flex-grow">
                <div className="flex items-start justify-between">
                    <TrophyIcon className={`w-8 h-8 ${challenge.isCompleted ? 'text-green-400' : 'text-yellow-400'}`} />
                    {challenge.isCompleted && (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-300">Completed</span>
                    )}
                </div>
                <h3 className="text-lg font-bold mt-4">{challenge.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{challenge.description}</p>
            </div>
            <div className="mt-6">
                <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-300">Progress</span>
                    <span className="text-sm font-medium text-gray-400">{challenge.progress} / {challenge.goal}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div className={`${challenge.isCompleted ? 'bg-green-500' : 'bg-indigo-600'} h-2.5 rounded-full`} style={{ width: `${progressPercentage}%` }}></div>
                </div>
                <p className="text-xs text-center text-gray-500 mt-2">Reward: {challenge.reward}</p>
            </div>
        </div>
    )
}

export default Challenges;
