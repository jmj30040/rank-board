'use client';

import { useState, useEffect } from 'react';
import { useParticipants } from '../hooks/useParticipants';
import { addParticipant, updateParticipant, deleteParticipant, updateScore } from '../lib/participantService';
import ScheduleSection from './ScheduleSection';

type TabType = 'participants' | 'schedule';

export default function AdminPanel() {
  const { participants, loading } = useParticipants();
  const [activeTab, setActiveTab] = useState<TabType>('participants');
  const [newName, setNewName] = useState('');
  const [newTeam, setNewTeam] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editTeam, setEditTeam] = useState('');
  const [scoreDelta, setScoreDelta] = useState(0);
  const [scoreReason, setScoreReason] = useState('');
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  const showToast = (message: string) => {
    setToast({ message, visible: true });
  };

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  const handleAddParticipant = async () => {
    if (!newName.trim() || !newTeam.trim()) return;
    await addParticipant(newName, newTeam);
    showToast('참가자가 추가되었습니다.');
    setNewName('');
    setNewTeam('');
  };

  const handleEditParticipant = async () => {
    if (!editingId || !editName.trim() || !editTeam.trim()) return;
    await updateParticipant(editingId, editName, editTeam);
    showToast('수정이 완료되었습니다.');
    setEditingId(null);
    setEditName('');
    setEditTeam('');
  };

  const handleDeleteParticipant = async (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      await deleteParticipant(id);
      showToast('삭제되었습니다.');
    }
  };

  const handleQuickScore = async (participantId: string, delta: number) => {
    const reason = `빠른 점수 반영 ${delta > 0 ? '+' : ''}${delta}`;
    await updateScore(participantId, delta, reason);
    showToast('점수가 반영되었습니다.');
  };

  const handleUpdateScore = async (participantId: string) => {
    if (scoreDelta === 0) return;
    await updateScore(participantId, scoreDelta, scoreReason.trim());
    showToast('점수가 반영되었습니다.');
    setScoreDelta(0);
    setScoreReason('');
  };

  const startEdit = (participant: any) => {
    setEditingId(participant.id);
    setEditName(participant.name);
    setEditTeam(participant.team);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-900">로딩 중...</div>;
  }

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'participants', label: '참가자 관리', icon: '👥' },
    { id: 'schedule', label: '일정 관리', icon: '📅' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-5 text-slate-900">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-slate-950">관리자 패널</h1>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-t-2xl shadow-lg border-b border-slate-200 mb-0">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="bg-white p-8 rounded-b-2xl shadow-xl border border-t-0 border-slate-200">
          {activeTab === 'participants' && (
            <div>
              {/* 참가자 추가 */}
              <div className="bg-slate-50 p-6 rounded-2xl shadow-md mb-8 border border-slate-200">
                <h2 className="text-xl font-semibold mb-4 text-slate-900">참가자 추가</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    placeholder="이름"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="flex-1 p-3 border border-slate-300 rounded-lg text-slate-900"
                  />
                  <input
                    type="text"
                    placeholder="팀명"
                    value={newTeam}
                    onChange={(e) => setNewTeam(e.target.value)}
                    className="flex-1 p-3 border border-slate-300 rounded-lg text-slate-900"
                  />
                  <button
                    onClick={handleAddParticipant}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    추가
                  </button>
                </div>
              </div>

              {/* 참가자 목록 */}
              <div>
                <h2 className="text-xl font-semibold mb-6 text-slate-900">참가자 목록</h2>
                <div className="space-y-4">
                  {participants.length === 0 ? (
                    <div className="text-center py-8 text-slate-600">참가자가 없습니다.</div>
                  ) : (
                    participants.map((participant) => (
                      <div key={participant.id} className="border border-slate-200 p-5 rounded-lg bg-slate-50">
                        {editingId === participant.id ? (
                          <div className="flex gap-3">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="flex-1 p-2 border border-slate-300 rounded text-slate-900"
                            />
                            <input
                              type="text"
                              value={editTeam}
                              onChange={(e) => setEditTeam(e.target.value)}
                              className="flex-1 p-2 border border-slate-300 rounded text-slate-900"
                            />
                            <button
                              onClick={handleEditParticipant}
                              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                            >
                              저장
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="bg-slate-500 text-white px-4 py-2 rounded hover:bg-slate-600"
                            >
                              취소
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <div className="font-semibold text-lg text-slate-900">{participant.name}</div>
                              <div className="text-sm text-slate-600">{participant.team}</div>
                              <div className="text-lg font-bold text-blue-600">점수: {participant.score}</div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEdit(participant)}
                                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
                              >
                                수정
                              </button>
                              <button
                                onClick={() => handleDeleteParticipant(participant.id)}
                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 점수 조정 */}
                        {editingId !== participant.id && (
                          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => handleQuickScore(participant.id, 10)}
                                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700"
                              >
                                +10
                              </button>
                              <button
                                onClick={() => handleQuickScore(participant.id, 5)}
                                className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-600"
                              >
                                +5
                              </button>
                              <button
                                onClick={() => handleQuickScore(participant.id, -5)}
                                className="bg-rose-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-rose-600"
                              >
                                -5
                              </button>
                              <button
                                onClick={() => handleQuickScore(participant.id, -10)}
                                className="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-rose-700"
                              >
                                -10
                              </button>
                            </div>
                            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                              <input
                                type="number"
                                placeholder="직접 입력"
                                value={scoreDelta || ''}
                                onChange={(e) => setScoreDelta(Number(e.target.value))}
                                className="w-full sm:w-28 p-2 border border-slate-300 rounded-lg text-sm text-slate-900"
                              />
                              <input
                                type="text"
                                placeholder="사유 (선택)"
                                value={scoreReason}
                                onChange={(e) => setScoreReason(e.target.value)}
                                className="flex-1 p-2 border border-slate-300 rounded-lg text-sm text-slate-900"
                              />
                              <button
                                onClick={() => handleUpdateScore(participant.id)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
                              >
                                적용
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && <ScheduleSection />}
        </div>
      </div>

      {/* 토스트 알림 */}
      {toast.visible && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl font-black flex items-center gap-2 border border-emerald-400">
            <span>✅</span> {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}