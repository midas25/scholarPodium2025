import React, { useState } from 'react';
import { ArrowLeft, Save, User, Sparkles } from 'lucide-react';
import { Character, CharacterAppearance, GAME_MODES } from '../App';

type AccountPageProps = {
  character: Character;
  username: string;
  onUpdateCharacter: (character: CharacterAppearance) => void;
  onBack: () => void;
  onLogout: () => void;
};

const avatars = ['🐯', '🐉', '🐰', '🦊', '🐼', '🐨', '🦁', '🐸', '🐵', '🐺', '🦄', '🐷'];
const colors = [
  '#FF6B35',
  '#4ECDC4',
  '#FFD93D',
  '#A78BFA',
  '#FB7185',
  '#34D399',
  '#60A5FA',
  '#F472B6',
  '#FBBF24',
  '#818CF8'
];
const accessoryOptions = [
  '왕관',
  '목걸이',
  '마법지팡이',
  '모자',
  '안경',
  '나비넥타이',
  '꽃',
  '별',
  '방패',
  '검'
];

export function AccountPage({
  character,
  username,
  onUpdateCharacter,
  onBack,
  onLogout
}: AccountPageProps) {
  const [name, setName] = useState(character.name);
  const [selectedAvatar, setSelectedAvatar] = useState(character.avatar);
  const [selectedColor, setSelectedColor] = useState(character.color);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>(character.accessories);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleAccessoryToggle = (accessory: string) => {
    if (selectedAccessories.includes(accessory)) {
      setSelectedAccessories(selectedAccessories.filter((a) => a !== accessory));
    } else {
      if (selectedAccessories.length < 3) {
        setSelectedAccessories([...selectedAccessories, accessory]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!name.trim()) {
      setError('캐릭터 이름을 입력해주세요');
      return;
    }

    if (name.trim().length < 2) {
      setError('캐릭터 이름은 최소 2글자 이상이어야 합니다');
      return;
    }

    onUpdateCharacter({
      name: name.trim(),
      avatar: selectedAvatar,
      color: selectedColor,
      accessories: selectedAccessories
    });

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const hasChanges =
    name !== character.name ||
    selectedAvatar !== character.avatar ||
    selectedColor !== character.color ||
    JSON.stringify(selectedAccessories.sort()) !== JSON.stringify(character.accessories.sort());

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-600 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white hover:text-white/80 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            랭킹으로 돌아가기
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition"
          >
            로그아웃
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-500 rounded-2xl mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-teal-600 mb-2">계정 정보</h1>
            <p className="text-gray-600">@{username}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-4 text-center">
              <div className="text-purple-600 mb-1">현재 점수</div>
              <div className="text-purple-900 text-2xl">{character.totalScore.toLocaleString()}</div>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-4 text-center">
              <div className="text-blue-600 mb-1">가입일</div>
              <div className="text-blue-900 text-sm">
                {new Date(character.createdAt).toLocaleDateString('ko-KR')}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {GAME_MODES.map((mode) => (
              <div
                key={mode.id}
                className="bg-white/70 border border-gray-100 rounded-2xl p-3 text-center shadow-sm"
              >
                <div className="text-sm text-gray-500">{mode.label}</div>
                <div className="text-lg text-gray-900 font-semibold">
                  {character.gameScores[mode.id]?.toLocaleString() ?? 0}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t-2 border-gray-100 pt-8 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-teal-600" />
              <h2 className="text-gray-900">캐릭터 수정</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Character Preview */}
              <div className="flex justify-center">
                <div
                  className="w-32 h-32 rounded-3xl flex items-center justify-center text-6xl shadow-2xl transform hover:scale-105 transition"
                  style={{ backgroundColor: selectedColor }}
                >
                  {selectedAvatar}
                </div>
              </div>

              {/* Character Name */}
              <div>
                <label className="block text-gray-700 mb-2">캐릭터 이름</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition"
                  placeholder="멋진 이름을 지어주세요"
                  maxLength={20}
                />
              </div>

              {/* Avatar Selection */}
              <div>
                <label className="block text-gray-700 mb-3">아바타 선택</label>
                <div className="grid grid-cols-6 gap-3">
                  {avatars.map((avatar) => (
                    <button
                      key={avatar}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`aspect-square rounded-xl text-3xl flex items-center justify-center transition transform hover:scale-110 ${
                        selectedAvatar === avatar
                          ? 'bg-teal-100 ring-4 ring-teal-500 scale-110'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-gray-700 mb-3">배경 색상</label>
                <div className="grid grid-cols-5 gap-3">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`aspect-square rounded-xl transition transform hover:scale-110 ${
                        selectedColor === color
                          ? 'ring-4 ring-gray-800 scale-110'
                          : 'ring-2 ring-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Accessories Selection */}
              <div>
                <label className="block text-gray-700 mb-3">
                  악세서리 선택 <span className="text-sm text-gray-500">(최대 3개)</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {accessoryOptions.map((accessory) => (
                    <button
                      key={accessory}
                      type="button"
                      onClick={() => handleAccessoryToggle(accessory)}
                      className={`px-4 py-2 rounded-xl transition ${
                        selectedAccessories.includes(accessory)
                          ? 'bg-teal-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {accessory}
                    </button>
                  ))}
                </div>
                {selectedAccessories.length > 0 && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {selectedAccessories.map((acc) => (
                      <span key={acc} className="px-3 py-1 bg-teal-100 text-teal-600 rounded-full text-sm">
                        {acc}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-600 rounded-xl p-3 text-center">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border-2 border-green-200 text-green-600 rounded-xl p-3 text-center">
                  캐릭터가 성공적으로 수정되었습니다!
                </div>
              )}

              <button
                type="submit"
                disabled={!hasChanges}
                className={`w-full py-4 rounded-xl transition transform ${
                  hasChanges
                    ? 'bg-gradient-to-r from-teal-600 to-blue-500 text-white hover:shadow-lg hover:scale-105'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" />
                  변경사항 저장
                </div>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
