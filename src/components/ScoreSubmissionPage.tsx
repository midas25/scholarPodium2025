import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Trophy, CheckCircle2, AlertCircle, Key } from 'lucide-react';
import { Character, GAME_MODES, GameModeId } from '../App';

type ScoreSubmissionPageProps = {
  allCharacters: (Character & { username: string })[];
  onSubmitScore: (
    username: string,
    gameId: GameModeId,
    score: number
  ) => Promise<boolean>;
  onBack: () => void;
};

type Status = {
  message: string;
  type: 'success' | 'error' | null;
};

export function ScoreSubmissionPage({
  allCharacters,
  onSubmitScore,
  onBack
}: ScoreSubmissionPageProps) {
  const [username, setUsername] = useState('');
  const [selectedGame, setSelectedGame] = useState<GameModeId>(GAME_MODES[0].id);
  const [score, setScore] = useState('');
  const [status, setStatus] = useState<Status>({ message: '', type: null });
  const [viewGame, setViewGame] = useState<GameModeId>(GAME_MODES[0].id);
  const [accessCode, setAccessCode] = useState('');
  const [hasAccess, setHasAccess] = useState(false);

  const pageAccessCode = import.meta.env.VITE_SCORE_PAGE_PASSWORD || '1234';

  const usernameExists = useMemo(() => {
    const trimmed = username.trim().toLowerCase();
    if (!trimmed) return false;
    return allCharacters.some(
      (character) => character.username.toLowerCase() === trimmed
    );
  }, [username, allCharacters]);

  const leaderboard = useMemo(() => {
    return [...allCharacters]
      .map((character) => ({
        ...character,
        gameScore: character.gameScores[viewGame] ?? 0
      }))
      .sort((a, b) => b.gameScore - a.gameScore);
  }, [allCharacters, viewGame]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus({ message: '', type: null });

    if (!username.trim()) {
      setStatus({ message: '닉네임을 입력해주세요.', type: 'error' });
      return;
    }

    if (!hasAccess) {
      setStatus({ message: '접근 비밀번호를 먼저 입력해주세요.', type: 'error' });
      return;
    }

    const numericScore = Number(score);
    if (!Number.isFinite(numericScore) || numericScore < 0) {
      setStatus({ message: '유효한 점수를 입력해주세요.', type: 'error' });
      return;
    }

    if (!usernameExists) {
      setStatus({
        message: '등록된 플레이어만 점수를 기록할 수 있습니다.',
        type: 'error'
      });
      return;
    }

    setStatus({ message: '점수를 등록하는 중입니다…', type: null });

    try {
      const success = await onSubmitScore(username, selectedGame, numericScore);
      if (!success) {
        setStatus({
          message: '점수 등록에 실패했습니다. 닉네임을 확인해주세요.',
          type: 'error'
        });
        return;
      }

      setStatus({ message: '점수가 등록되었습니다!', type: 'success' });
      setScore('');
    } catch (error) {
      console.error('점수 등록 실패:', error);
      setStatus({
        message: '점수 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        type: 'error'
      });
    }
  };

  useEffect(() => {
    if (hasAccess) {
      setStatus({ message: '', type: null });
    }
  }, [hasAccess]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4 text-gray-900">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            돌아가기
          </button>
          <div className="text-sm text-gray-500">
            닉네임과 게임을 선택하고 점수를 입력하면 즉시 랭킹에 반영됩니다.
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
            <div className="mb-6">
              <div className="text-3xl mb-2 flex items-center gap-2">
                <Trophy className="w-7 h-7 text-yellow-500" />
                점수 입력
              </div>
              <p className="text-gray-600 text-sm">
                이미 생성된 플레이어만 점수를 업데이트할 수 있습니다. 계정이 없다면 먼저 캐릭터를 만들어주세요.
              </p>
            </div>

            {!hasAccess && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (accessCode === pageAccessCode) {
                    setHasAccess(true);
                    setStatus({ message: '', type: null });
                  } else {
                    setStatus({ message: '접근 비밀번호가 올바르지 않습니다.', type: 'error' });
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm text-gray-600 mb-1 flex items-center gap-2">
                    페이지 비밀번호
                    <Key className="w-4 h-4 text-gray-400" />
                  </label>
                  <input
                    type="password"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="w-full rounded-2xl bg-gray-50 text-gray-900 px-4 py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="Access code"
                  />
                </div>

                {status.message && (
                  <div
                    className={`flex items-center gap-2 rounded-2xl px-4 py-3 ${
                      status.type === 'success'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {status.type === 'success' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                    <span>{status.message}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:opacity-90 transition"
                >
                  입장하기
                </button>
              </form>
            )}

            {hasAccess && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="md:col-span-1">
                    <label className="block text-sm text-gray-600 mb-1">닉네임</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full rounded-2xl bg-gray-50 text-gray-900 px-4 py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      placeholder="예: mystic"
                    />
                    {username && (
                      <p
                        className={`mt-2 text-xs ${
                          usernameExists ? 'text-emerald-600' : 'text-rose-500'
                        }`}
                      >
                        {usernameExists
                          ? '등록된 플레이어입니다.'
                          : '존재하지 않는 닉네임입니다.'}
                      </p>
                    )}
                  </div>
                <div className="md:col-span-1">
                  <label className="block text-sm text-gray-600 mb-1">게임</label>
                  <select
                    value={selectedGame}
                    onChange={(e) => setSelectedGame(e.target.value as GameModeId)}
                    className="w-full rounded-2xl bg-gray-50 text-gray-900 px-4 py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    {GAME_MODES.map((mode) => (
                      <option key={mode.id} value={mode.id}>
                        {mode.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm text-gray-600 mb-1">점수</label>
                  <input
                    type="number"
                    min="0"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="w-full rounded-2xl bg-gray-50 text-gray-900 px-4 py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="예: 12000"
                  />
                </div>
                </div>

              {status.message && (
                <div
                  className={`flex items-center gap-2 rounded-2xl px-4 py-3 ${
                    status.type === 'success'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {status.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <span>{status.message}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:opacity-90 transition"
              >
                점수 등록
              </button>
              </form>
            )}
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 text-gray-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                게임별 랭킹
              </h2>
              <select
                value={viewGame}
                onChange={(e) => setViewGame(e.target.value as GameModeId)}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
              >
                {GAME_MODES.map((mode) => (
                  <option key={mode.id} value={mode.id}>
                    {mode.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100">
              <table className="w-full">
                <thead className="bg-gray-50 text-left text-sm text-gray-500">
                  <tr>
                    <th className="px-4 py-3">순위</th>
                    <th className="px-4 py-3">플레이어</th>
                    <th className="px-4 py-3 text-right">점수</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                        아직 등록된 플레이어가 없습니다.
                      </td>
                    </tr>
                  )}
                  {leaderboard.map((player, index) => (
                    <tr key={player.id} className="border-t border-gray-100">
                      <td className="px-4 py-3 font-semibold text-gray-700">#{index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold">
                          {player.name}
                          <span className="text-gray-500"> ({player.mbti})</span>
                        </div>
                        <div className="text-xs text-gray-500">@{player.username}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {player.gameScore.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
