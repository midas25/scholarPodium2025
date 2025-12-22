import React, { useState } from 'react';
import { ArrowLeft, Save, User, Sparkles } from 'lucide-react';
import { Character, CharacterAppearance, GAME_MODES } from '../App';
import { AVATAR_IMAGES } from '../assets/avatars';
import { AvatarVisual } from './AvatarVisual';

type AccountPageProps = {
  character: Character;
  username: string;
  onUpdateCharacter: (character: CharacterAppearance) => void;
  onBack: () => void;
  onLogout: () => void;
};

const avatars = AVATAR_IMAGES;
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
const mbtiOptions = [
  'ISTJ', 'ISFJ', 'INFJ', 'INTJ',
  'ISTP', 'ISFP', 'INFP', 'INTP',
  'ESTP', 'ESFP', 'ENFP', 'ENTP',
  'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'
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
  const [selectedMbti, setSelectedMbti] = useState(character.mbti);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
      mbti: selectedMbti
    });

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const hasChanges =
    name !== character.name ||
    selectedAvatar !== character.avatar ||
    selectedColor !== character.color ||
    selectedMbti !== character.mbti;

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
          <div className="grid grid-cols-1 gap-4 mb-8">
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
                className="w-32 h-32 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition"
                style={{ backgroundColor: selectedColor }}
              >
                <AvatarVisual
                  value={selectedAvatar}
                  alt={`${name || '선택한'} 아바타`}
                  imgClassName="w-24 h-24 object-contain"
                  textClassName="text-6xl"
                />
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
                    className={`aspect-square rounded-xl flex items-center justify-center transition transform hover:scale-110 ${
                      selectedAvatar === avatar
                        ? 'bg-teal-100 ring-4 ring-teal-500 scale-110'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <AvatarVisual
                      value={avatar}
                      alt="아바타 선택"
                      imgClassName="w-10 h-10 object-contain"
                      textClassName="text-3xl"
                    />
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

              {/* MBTI Selection */}
              <div>
                <label className="block text-gray-700 mb-3">
                  MBTI 선택
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  {mbtiOptions.map((mbti) => (
                    <button
                      key={mbti}
                      type="button"
                      onClick={() => setSelectedMbti(mbti)}
                      className={`px-4 py-2 rounded-xl transition ${
                        selectedMbti === mbti
                          ? 'bg-teal-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {mbti}
                    </button>
                  ))}
                </div>
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
