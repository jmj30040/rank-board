'use client';

import { useState, useEffect } from 'react';
import { addParticipant, updateParticipant, deleteParticipant as deleteParticipantService, updateScore } from '../lib/participantService';
import { addTeam, updateTeam, deleteTeam } from '../lib/teamService';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, limit, doc, updateDoc, increment, serverTimestamp, writeBatch, where, getDocs, addDoc, deleteDoc, setDoc } from 'firebase/firestore'; // deleteDoc 추가
import ScheduleManager from '../components/admin/ScheduleManager'; // 경로 수정 및 컴포넌트 이름 변경
import { Team, ScoreLog, Participant, Schedule } from '../types';
import Link from 'next/link';

type TabType = 'dashboard' | 'teams' | 'participants' | 'scores' | 'schedule' | 'settings';

export default function AdminPanel() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [scoreTab, setScoreTab] = useState<'team' | 'individual'>('team');
  
  // 실시간 구독 설정
  useEffect(() => {
    setLoading(true);
    
    const unsubTeams = onSnapshot(
      collection(db, 'teams'),
      (snap) => setTeams(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team))),
      (err) => { console.error("teams error", err); setError(err.message); }
    );

    const unsubParts = onSnapshot( // participants 구독
      collection(db, 'participants'),
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name ?? '이름 없음',
          department: doc.data().department ?? '부서 미입력',
          teamId: doc.data().teamId ?? null,
          teamName: doc.data().teamName ?? '팀 미배정',
          teamColor: doc.data().teamColor ?? '#94A3B8',
          score: Number(doc.data().score ?? 0),
          createdAt: doc.data().createdAt?.toDate() ?? new Date(),
          updatedAt: doc.data().updatedAt?.toDate() ?? new Date(),
        } as Participant));
        setParticipants(list);
      },
      (err) => { console.error("participants error", err); setError(err.message); }
    );

    const unsubSchedules = onSnapshot( // schedules 구독
      collection(db, 'schedules'),
      (snap) => setSchedules(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Schedule))),
      (err) => { console.error("schedules error", err); setError(err.message); }
    );

    const unsubSettings = onSnapshot(doc(db, 'settings', 'event'), (snap) => { // settings 구독
      if (snap.exists()) setEventSettings(snap.data() as any);
    }, (err) => { console.error("settings error", err); setError(err.message); });

    setLoading(false); // 모든 구독이 시작된 후 로딩 상태 해제

    return () => { unsubTeams(); unsubParts(); unsubSchedules(); unsubSettings(); };
  }, []);

  // 팀 관련 상태
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamColor, setNewTeamColor] = useState('#3b82f6');

  // 참가자 관련 상태
  const [newName, setNewName] = useState('');
  const [newDept, setNewDept] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editTeamId, setEditTeamId] = useState('');

  // 점수 관련 상태
  const [scoreDelta, setScoreDelta] = useState<number | ''>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreParticipantSearch, setScoreParticipantSearch] = useState('');
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  const showToast = (message: string) => { setToast({ message, visible: true }); };

  useEffect(() => {
    if (toast.visible) { const timer = setTimeout(() => setToast(p => ({ ...p, visible: false })), 3000); return () => clearTimeout(timer); }
  }, [toast.visible]);

  const handleTeamSave = async () => {
    if (!newTeamName.trim()) return;
    
    try {
      const confirmMessage = editingId ? '팀 정보를 수정하시겠습니까?' : '새로운 팀을 추가하시겠습니까?';
      if (!window.confirm(confirmMessage)) return;

      if (editingId && activeTab === 'teams') {
        // 1. 팀 문서 업데이트
        await updateDoc(doc(db, 'teams', editingId), {
          name: newTeamName,
          color: newTeamColor,
          updatedAt: serverTimestamp(),
        });

        // 2. 소속 참가자 데이터 동기화 (Batch Update)
        const q = query(collection(db, 'participants'), where('teamId', '==', editingId));
        const querySnapshot = await getDocs(q);
        const batch = writeBatch(db);
        
        querySnapshot.forEach((participantDoc) => {
          batch.update(participantDoc.ref, {
            teamName: newTeamName,
            teamColor: newTeamColor,
            updatedAt: serverTimestamp(),
          });
        });
        await batch.commit();
        
        showToast('팀 정보가 수정되었습니다.');
      } else {
        await addTeam(newTeamName, newTeamColor);
        showToast('팀이 추가되었습니다.');
      }
      setNewTeamName(''); 
      setEditingId(null);
      setShowTeamForm(false);
    } catch (err) {
      console.error(err);
      alert('팀 저장에 실패했습니다.');
    }
  };

  const startEditTeam = (team: Team) => {
    setEditingId(team.id);
    setNewTeamName(team.name);
    setNewTeamColor(team.color);
    setShowTeamForm(true);
  };

  const handleSaveSettings = async () => {
    const { mainTitle, eventName, startDate, endDate, heroDescription } = eventSettings;
    
    if (!mainTitle || !eventName || !startDate || !endDate || !heroDescription) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      alert('종료일이 시작일보다 빠를 수 없습니다.');
      return;
    }

    if (!window.confirm('행사 설정을 저장하시겠습니까?')) return;

    try {
      await setDoc(doc(db, 'settings', 'event'), {
        ...eventSettings,
        updatedAt: serverTimestamp()
      });
      showToast('행사 설정이 저장되었습니다.');
    } catch (err) {
      console.error(err);
      alert('설정 저장에 실패했습니다.');
    }
  };

  const handleDeleteTeam = async (id: string) => {
    if (!confirm('팀을 삭제하시겠습니까?')) return;
    try {
      await deleteTeam(id);
      showToast('팀이 삭제되었습니다.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddParticipant = async () => {
    if (!newName.trim()) return;
    const team = teams.find(t => t.id === selectedTeamId);
    await addParticipant(
      newName, 
      newDept || '부서 미입력', 
      selectedTeamId || null, 
      team?.name || '팀 미배정', 
      team?.color || '#94A3B8'
    );
    showToast('참가자가 추가되었습니다.');
    setNewName(''); setNewDept(''); setSelectedTeamId('');
  };

  const handleEditParticipant = async () => {
    if (!window.confirm('참가자 정보를 수정하시겠습니까?')) {
      return;
    }
    if (!editingId || !editName.trim()) return;
    const team = teams.find(t => t.id === editTeamId);
    await updateParticipant(
      editingId, 
      editName, 
      editDept, 
      editTeamId || null, 
      team?.name || '팀 미배정', 
      team?.color || '#94A3B8'
    );
    showToast('수정이 완료되었습니다.');
    setEditingId(null); setEditName(''); setEditDept(''); setEditTeamId('');
  };

  const handleScoreUpdate = async (type: 'participant' | 'team', id: string, delta: number | string) => {
    const numericDelta = Number(delta);
    if (isNaN(numericDelta)) return;

    if (type === 'participant') {
      await updateScore(id, numericDelta);
    } else {
      try {
        await updateDoc(doc(db, 'teams', id), {
          score: increment(numericDelta),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.error(err);
        alert('팀 점수 반영에 실패했습니다.');
      }
    }
    showToast('점수가 반영되었습니다.');
  };

  const handleDeleteParticipant = async (id: string) => {
    if (confirm('이 참가자를 삭제하시겠습니까?')) {
      try {
        await deleteParticipantService(id); // participantService의 deleteParticipant 사용
        showToast('참가자가 삭제되었습니다.');
      } catch (err) {
        console.error(err);
        alert('참가자 삭제에 실패했습니다.');
      }
    }
  };

  const startEdit = (participant: any) => {
    setEditingId(participant.id);
    setEditName(participant.name);
    setEditDept(participant.department || '');
    setEditTeamId(participant.teamId || '');
  };

  const filteredParticipants = participants.filter((participant) => {
    // searchTerm이 정의되지 않았을 경우를 위한 방어 코드
    const keyword = (searchTerm || '').trim().toLowerCase();
    if (!keyword) return true;
    return (
      participant.name.toLowerCase().includes(keyword) || 
      (participant.teamName && participant.teamName.toLowerCase().includes(keyword)) ||
      (participant.department && participant.department.toLowerCase().includes(keyword))
    );
  });

  const filteredScoreParticipants = participants.filter((participant) => {
    const keyword = (scoreParticipantSearch || '').trim().toLowerCase();
    if (!keyword) return true;
    return (
      participant.name?.toLowerCase().includes(keyword) ||
      participant.department?.toLowerCase().includes(keyword) ||
      participant.teamName?.toLowerCase().includes(keyword)
    );
  });

  // 대시보드 지표 계산
  const topTeam = (teams || []).length > 0 ? [...teams].sort((a, b) => b.score - a.score)[0] : null;

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'teams', label: '팀 관리', icon: '🚩' },
    { id: 'participants', label: '참가자 관리', icon: '👥' },
    { id: 'scores', label: '점수 관리', icon: '🎯' },
    { id: 'schedule', label: '일정 관리', icon: '📅' },
    { id: 'settings', label: '행사 설정', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
      {/* 사이드바 네비게이션 */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-100 p-6 flex flex-col shrink-0">
        <div className="mb-10">
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter">Hub Ops</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Refresh Day Management</p>
        </div>
        <nav className="flex-1 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all text-sm ${activeTab === tab.id ? 'bg-sky-500 text-white shadow-lg shadow-sky-100' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
            >
              <span className="text-lg">{tab.icon}</span> {tab.label}
            </button>
          ))}
        </nav>
        <Link href="/" className="mt-10 px-4 py-4 rounded-2xl font-black text-xs text-rose-400 hover:bg-rose-50 flex items-center gap-2 uppercase tracking-widest">
          🚪 Exit Admin
        </Link>
      </aside>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 min-h-[600px]">
          {activeTab === 'teams' && (
            <div className="animate-in fade-in duration-500">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-black">팀 관리</h2>
                  <p className="text-sm text-slate-400 font-bold">게임 점수 집계를 위한 팀을 생성합니다.</p>
                </div>
                <button onClick={() => setShowTeamForm(!showTeamForm)} className="bg-sky-500 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-sky-100">+ 팀 추가</button>
              </div>

              {showTeamForm && (
                <div className="bg-slate-50 p-6 rounded-[2rem] mb-8 border border-slate-100 flex gap-4 items-end animate-in slide-in-from-top-4">
                  <div className="flex-1">
                    <label className="block text-xs font-black text-slate-400 mb-2 ml-1">팀명</label>
                    <input type="text" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} className="w-full p-4 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-sky-100 transition-all" placeholder="예: A팀" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 mb-2 ml-1">팀 색상</label>
                    <input type="color" value={newTeamColor} onChange={(e) => setNewTeamColor(e.target.value)} className="h-[52px] w-20 rounded-2xl border border-slate-200 cursor-pointer p-1 bg-white" />
                  </div>
                  <button onClick={handleTeamSave} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-black transition-all active:scale-95">{editingId ? '수정 완료' : '저장'}</button>
                  <button onClick={() => { setShowTeamForm(false); setEditingId(null); setNewTeamName(''); }} className="bg-slate-200 text-slate-500 px-6 py-4 rounded-2xl font-black hover:bg-slate-300 transition-all">취소</button>
                </div>
              )}

              {teams.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-4xl mb-4">🚩</p>
                  <p className="text-slate-400 font-black mb-6">아직 등록된 팀이 없습니다.</p>
                  <button onClick={() => setShowTeamForm(true)} className="bg-sky-500 text-white px-8 py-4 rounded-2xl font-black">+ 첫 팀 추가</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teams.map(team => (
                    <div key={team.id} className="p-6 rounded-[2rem] border border-slate-100 bg-white flex justify-between items-center shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-4 h-12 rounded-full" style={{ backgroundColor: team.color }}></div>
                        <div>
                          <h3 className="font-black text-lg">{team.name}</h3>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{team.score}점 / 소속 {participants.filter(p => p.teamId === team.id).length}명</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => startEditTeam(team)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors">✏️</button>
                      <button onClick={() => handleDeleteTeam(team.id)} className="p-3 bg-rose-50 text-rose-400 rounded-xl hover:bg-rose-100 transition-colors">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'participants' && (
            <div className="animate-in fade-in duration-500">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-black">참가자 관리</h2>
                  <p className="text-sm text-slate-400 font-bold">
                    {searchTerm.trim() 
                      ? `검색 결과 ${filteredParticipants.length}명 / 전체 ${participants.length}명`
                      : `총 참가자 ${participants.length}명`
                    }
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 mb-10">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-sky-500 rounded-full"></span>
                  {editingId ? '참가자 정보 수정' : '신규 참가자 등록'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 mb-2 ml-1">참가자 이름</label>
                    <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full p-4 border border-slate-200 rounded-2xl font-bold" placeholder="실명 입력" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 mb-2 ml-1">부서명</label>
                    <input type="text" value={newDept} onChange={(e) => setNewDept(e.target.value)} className="w-full p-4 border border-slate-200 rounded-2xl font-bold" placeholder="예) 재무경영정보실" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 mb-2 ml-1">게임 팀 선택</label>
                    <select value={selectedTeamId} onChange={(e) => setSelectedTeamId(e.target.value)} className="w-full p-4 border border-slate-200 rounded-2xl font-bold bg-white">
                      <option value="">팀 미배정</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={editingId ? handleEditParticipant : handleAddParticipant} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-black transition-all active:scale-[0.98]">{editingId ? '수정 완료' : '참가자 등록하기'}</button>
              </div>

              <div className="space-y-6">
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2">🔍</span>
                  <input 
                    type="text" 
                    placeholder="이름, 부서 또는 배정된 팀명으로 검색"
                    className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-3xl shadow-sm font-bold text-sm outline-none focus:ring-4 focus:ring-sky-50 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">✕</button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {participants.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                      <p className="text-4xl mb-4">👥</p>
                      <p className="text-slate-400 font-black mb-2">아직 등록된 참가자가 없습니다.</p>
                      <p className="text-slate-300 font-bold text-xs">상단의 폼을 통해 첫 참가자를 등록해보세요!</p>
                    </div>
                  ) : filteredParticipants.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                      <p className="text-4xl mb-4">🔎</p>
                      <p className="text-slate-400 font-black mb-6">검색 결과가 없습니다.</p>
                      <button onClick={() => setSearchTerm('')} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs hover:bg-black transition-all">검색 초기화</button>
                    </div>
                  ) : (
                    filteredParticipants.map((participant) => (
                      <div key={participant.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:border-sky-200 transition-all hover:shadow-md">
                        {editingId === participant.id ? (
                          <div className="space-y-3">
                            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl text-xs font-bold" />
                            <input type="text" value={editDept} onChange={(e) => setEditDept(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl text-xs font-bold" />
                            <select value={editTeamId} onChange={(e) => setEditTeamId(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl text-xs font-bold bg-white">
                              <option value="">팀 미배정</option>
                              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            <div className="flex gap-2">
                              <button onClick={handleEditParticipant} className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold text-xs">완료</button>
                              <button onClick={() => setEditingId(null)} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs">취소</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-inner" style={{ backgroundColor: participant.teamColor || '#94A3B8' }}>{participant.name[0]}</div>
                              <div className="flex-1 min-w-0">
                                <p className="font-black text-slate-900 truncate">{participant.name} <span className="text-[10px] text-slate-300 font-bold ml-1 uppercase">{participant.department}</span></p>
                                <p className="text-[10px] font-black uppercase tracking-tighter text-sky-500">Team: {participant.teamName} / {participant.score}pt</p>
                              </div>
                            </div>
                            <div className="flex gap-2 pt-4 border-t border-slate-50">
                              <button onClick={() => startEdit(participant)} className="flex-1 py-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 font-black text-[10px] uppercase tracking-widest transition-colors">Edit</button>
                              <button onClick={() => handleDeleteParticipant(participant.id)} className="flex-1 py-2.5 bg-rose-50 text-rose-300 rounded-xl hover:bg-rose-100 font-black text-[10px] uppercase tracking-widest transition-colors">Delete</button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'scores' && (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-2xl font-black mb-2">점수 관리</h2>
              <p className="text-sm text-slate-400 font-bold mb-8">팀 또는 개인에게 실시간으로 점수를 부여합니다.</p>
              
              <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit mb-8">
                <button onClick={() => setScoreTab('team')} className={`px-6 py-2 rounded-xl font-black text-sm transition-all ${scoreTab === 'team' ? 'bg-white shadow-sm text-sky-500' : 'text-slate-400'}`}>팀 점수</button>
                <button onClick={() => setScoreTab('individual')} className={`px-6 py-2 rounded-xl font-black text-sm transition-all ${scoreTab === 'individual' ? 'bg-white shadow-sm text-sky-500' : 'text-slate-400'}`}>개인 점수</button>
              </div>

              {scoreTab === 'individual' && participants.length > 0 && (
                <div className="relative mb-6">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                  <input
                    type="text"
                    placeholder="이름, 부서명, 팀명으로 검색하세요"
                    value={scoreParticipantSearch}
                    onChange={(e) => setScoreParticipantSearch(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-sky-100 outline-none transition-all font-bold text-sm"
                  />
                  {scoreParticipantSearch && (
                    <button
                      onClick={() => setScoreParticipantSearch('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}

              {scoreTab === 'team' ? (
                teams.length === 0 ? (
                  <div className="py-20 text-center bg-slate-50 rounded-[2.5rem]">
                    <p className="text-slate-400 font-bold mb-4">등록된 팀이 없습니다.</p>
                    <button onClick={() => setActiveTab('teams')} className="text-sky-500 font-black">팀 관리에서 팀을 먼저 추가해주세요 →</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {teams.map(team => (
                      <div key={team.id} className="p-6 rounded-[2.5rem] border border-slate-100 bg-white shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }}></div>
                            <span className="font-black text-lg">{team.name}</span>
                          </div>
                          <span className="text-2xl font-black text-sky-500">{team.score}점</span>
                        </div>
                        <div className="flex flex-col gap-4">
                          <div className="grid grid-cols-4 gap-2">
                            {['+10', '+5', '-5', '-10'].map(val => (
                              <button key={val} onClick={() => handleScoreUpdate('team', team.id, val)} className="py-3 bg-slate-50 rounded-xl font-black text-sm hover:bg-sky-500 hover:text-white transition-all active:scale-95">{val}</button>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input 
                              type="number" 
                              placeholder="점수 직접 입력"
                              className="flex-1 p-3 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-sky-100"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleScoreUpdate('team', team.id, (e.target as HTMLInputElement).value);
                                  (e.target as HTMLInputElement).value = '';
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                participants.length === 0 ? (
                  <div className="py-20 text-center bg-slate-50 rounded-[2.5rem]">
                    <p className="text-slate-400 font-bold mb-4">등록된 참가자가 없습니다.</p>
                    <button onClick={() => setActiveTab('participants')} className="text-sky-500 font-black">참가자 관리에서 참가자를 먼저 추가해주세요 →</button>
                  </div>
                ) : filteredScoreParticipants.length === 0 ? (
                  <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                    <p className="text-slate-400 font-black">검색 결과가 없습니다.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredScoreParticipants.map(p => (
                      <div key={p.id} className="p-6 rounded-[2rem] border border-slate-100 bg-white shadow-sm flex items-center justify-between">
                        <div>
                          <p className="font-black text-slate-800">{p.name} <span className="text-xs text-slate-400 ml-1">{p.department}</span></p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.teamName}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xl font-black text-sky-500 w-16 text-right">{p.score}점</span>
                          <div className="flex gap-1">
                            {['+10', '+5', '-5', '-10'].map(val => (
                              <button key={val} onClick={() => handleScoreUpdate('participant', p.id, parseInt(val))} className="w-10 h-10 bg-slate-50 rounded-lg font-black text-xs hover:bg-emerald-500 hover:text-white transition-all">{val}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-in fade-in duration-500 max-w-2xl">
              <h2 className="text-2xl font-black mb-2">행사 설정</h2>
              <p className="text-sm text-slate-400 font-bold mb-10">메인 페이지에 표시될 행사 정보를 관리합니다.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">메인 타이틀</label>
                  <input type="text" value={eventSettings.mainTitle} onChange={e => setEventSettings({...eventSettings, mainTitle: e.target.value})} className="w-full p-4 border border-slate-200 rounded-2xl font-bold" placeholder="예: Refresh Day" />
                </div>
                
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">행사명</label>
                  <input type="text" value={eventSettings.eventName} onChange={e => setEventSettings({...eventSettings, eventName: e.target.value})} className="w-full p-4 border border-slate-200 rounded-2xl font-bold" placeholder="예: 재무경영정보실 워크샵" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">시작일</label>
                    <input type="date" value={eventSettings.startDate} onChange={e => setEventSettings({...eventSettings, startDate: e.target.value})} className="w-full p-4 border border-slate-200 rounded-2xl font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">종료일</label>
                    <input type="date" value={eventSettings.endDate} onChange={e => setEventSettings({...eventSettings, endDate: e.target.value})} className="w-full p-4 border border-slate-200 rounded-2xl font-bold" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">메인 설명 문구</label>
                  <textarea value={eventSettings.heroDescription} onChange={e => setEventSettings({...eventSettings, heroDescription: e.target.value})} rows={4} className="w-full p-4 border border-slate-200 rounded-2xl font-bold resize-none" placeholder="행사 설명을 입력하세요 (줄바꿈 가능)" />
                </div>

                <button onClick={handleSaveSettings} className="w-full bg-sky-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-sky-100 hover:bg-sky-600 transition-all active:scale-[0.98]">
                  행사 설정 저장
                </button>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && <ScheduleManager />}
        </div>
      </main>
    </div>
  );
}