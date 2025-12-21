import React, { useMemo, useState } from 'react';
import { Trophy, Medal, Crown, Settings, LogOut } from 'lucide-react';
import { Character, GAME_MODES, GameModeId } from '../App';

type MainPageProps = {
  currentCharacter: Character;
  currentUsername: string;
  allCharacters: (Character & { username: string })[];
  onNavigateToAccount: () => void;
  onLogout: () => void;
};

export function MainPage({
  currentCharacter,
  currentUsername,
  allCharacters,
  onNavigateToAccount,
  onLogout
}: MainPageProps) {
  const [activeGame, setActiveGame] = useState<GameModeId>(GAME_MODES[0].id);

  const totalLeaderboard = useMemo(
    () => [...allCharacters].sort((a, b) => b.totalScore - a.totalScore),
    [allCharacters]
  );

  const gameLeaderboard = useMemo(
    () => [...allCharacters].sort((a, b) => (b.gameScores[activeGame] ?? 0) - (a.gameScores[activeGame] ?? 0)),
    [allCharacters, activeGame]
  );

  const currentRank = totalLeaderboard.findIndex((c) => c.username === currentUsername) + 1;
  const activeMode = GAME_MODES.find((mode) => mode.id === activeGame);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-600" />;
    return <Trophy className="w-5 h-5 text-gray-400" />;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500';
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600';
    return 'bg-gradient-to-r from-purple-400 to-pink-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🎪</div>
            <div>
              <h1 className="text-white">축제 대기줄 랭킹</h1>
              <p className="text-white/80 text-sm">실시간 플레이어 순위</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onNavigateToAccount}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition"
              title="계정 정보"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={onLogout}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition"
              title="로그아웃"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* Current User Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-lg"
              style={{ backgroundColor: currentCharacter.color }}
            >
              {currentCharacter.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-gray-900">{currentCharacter.name}</h2>
                <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm">
                  @{currentUsername}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {getRankIcon(currentRank)}
                  <span className="text-gray-700">#{currentRank} 순위</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="text-gray-900">{currentCharacter.totalScore.toLocaleString()} 점</span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                {GAME_MODES.map((mode) => (
                  <div key={mode.id} className="bg-gray-100 rounded-2xl p-3 text-center">
                    <div className="text-xs text-gray-500">{mode.label}</div>
                    <div className="text-base font-semibold text-gray-900">
                      {currentCharacter.gameScores[mode.id]?.toLocaleString() ?? 0}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Rankings List */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-6">
            <h2 className="text-white flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              {activeMode ? `${activeMode.label} 랭킹` : '전체 랭킹'}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 p-4 border-b border-gray-100 bg-gray-50">
            {GAME_MODES.map((mode) => {
              const isActive = mode.id === activeGame;
              return (
                <button
                  key={mode.id}
                  onClick={() => setActiveGame(mode.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    isActive
                      ? 'bg-purple-50 text-purple-700 border border-purple-500 shadow-sm'
                      : 'bg-white text-gray-600 border border-transparent hover:bg-gray-100'
                  }`}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>

          <div className="divide-y divide-gray-100">
            {gameLeaderboard.map((character, index) => {
              const rank = index + 1;
              const isCurrentUser = character.username === currentUsername;
              const gameScore = character.gameScores[activeGame] ?? 0;

              return (
                <div
                  key={character.id}
                  className={`p-4 flex items-center gap-4 transition ${
                    isCurrentUser ? 'bg-purple-50' : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Rank Badge */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${getRankBadge(
                      rank
                    )} text-white shadow-md`}
                  >
                    {rank}
                  </div>

                  {/* Character Avatar */}
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shadow-md"
                    style={{ backgroundColor: character.color }}
                  >
                    {character.avatar}
                  </div>

                  {/* Character Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-gray-900">
                        {character.name}
                        <span className="text-gray-500"> ({character.mbti})</span>
                      </h3>
                      {isCurrentUser && (
                        <span className="px-2 py-1 bg-purple-500 text-white rounded-full text-xs">
                          나
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span>@{character.username}</span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex items-center gap-2">
                    {getRankIcon(rank)}
                    <div className="text-right">
                      <span className="text-gray-900 block">{gameScore.toLocaleString()}</span>
                      <span className="text-xs text-gray-500">
                        총점 {character.totalScore.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
