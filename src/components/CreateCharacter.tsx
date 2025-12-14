import React, { useState } from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { CharacterAppearance } from '../App';

type CreateCharacterProps = {
  onCreateCharacter: (character: CharacterAppearance) => void;
  onBack: () => void;
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

export function CreateCharacter({ onCreateCharacter, onBack }: CreateCharacterProps) {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [error, setError] = useState('');

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

    if (!name.trim()) {
      setError('캐릭터 이름을 입력해주세요');
      return;
    }

    if (name.trim().length < 2) {
      setError('캐릭터 이름은 최소 2글자 이상이어야 합니다');
      return;
    }

    onCreateCharacter({
      name: name.trim(),
      avatar: selectedAvatar,
      color: selectedColor,
      accessories: selectedAccessories
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 p-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-white hover:text-white/80 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          뒤로 가기
        </button>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-purple-600 mb-2">나만의 캐릭터 생성</h1>
            <p className="text-gray-600">축제에서 사용할 캐릭터를 꾸며보세요!</p>
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition"
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
                        ? 'bg-purple-100 ring-4 ring-purple-500 scale-110'
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
                      selectedColor === color ? 'ring-4 ring-gray-800 scale-110' : 'ring-2 ring-gray-200'
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
                        ? 'bg-purple-500 text-white'
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
                    <span key={acc} className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm">
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

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-4 rounded-xl hover:shadow-lg transition transform hover:scale-105"
            >
              캐릭터 생성하기
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
