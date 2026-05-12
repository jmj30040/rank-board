'use client';

import { useState, useEffect } from 'react';
import { useSchedules } from '../hooks/useSchedules';
import { addSchedule, updateSchedule, deleteSchedule } from '../lib/scheduleService';
import AddressSearchModal from '../components/AddressSearchModal';
import { Schedule } from '../types';

export default function ScheduleSection() {
  const { schedules, loading } = useSchedules();
  const [showForm, setShowForm] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
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

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDateTime: '',
    endDateTime: '',
    placeName: '',
    address: '',
    roadAddress: '',
    latitude: 0,
    longitude: 0,
  });

  const handleAddressSelect = (address: any) => {
    setSelectedAddress(address);
    setFormData((prev) => ({
      ...prev,
      placeName: address.name,
      address: address.address,
      roadAddress: address.roadAddress,
      latitude: address.latitude,
      longitude: address.longitude,
    }));
  };

  const handleSubmit = async () => {
    if (
      !formData.title.trim() ||
      !formData.startDateTime ||
      !formData.endDateTime ||
      !formData.placeName.trim()
    ) {
      alert('필수 항목을 입력하세요.');
      return;
    }

    const confirmMessage = editingId ? '일정을 수정하시겠습니까?' : '새로운 일정을 추가하시겠습니까?';
    if (!window.confirm(confirmMessage)) return;

    try {
      const scheduleData = {
        title: formData.title,
        description: formData.description,
        startDateTime: new Date(formData.startDateTime),
        endDateTime: new Date(formData.endDateTime),
        placeName: formData.placeName,
        address: formData.address,
        roadAddress: formData.roadAddress,
        latitude: formData.latitude,
        longitude: formData.longitude,
        sortOrder: schedules.length,
      };

      if (editingId) {
        await updateSchedule(editingId, scheduleData);
        showToast('일정이 수정되었습니다.');
        setEditingId(null);
      } else {
        await addSchedule(scheduleData);
        showToast('일정이 추가되었습니다.');
      }

      setFormData({
        title: '',
        description: '',
        startDateTime: '',
        endDateTime: '',
        placeName: '',
        address: '',
        roadAddress: '',
        latitude: 0,
        longitude: 0,
      });
      setShowForm(false);
      setSelectedAddress(null);
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('일정 저장에 실패했습니다.');
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingId(schedule.id);
    setFormData({
      title: schedule.title,
      description: schedule.description,
      startDateTime: schedule.startDateTime.toISOString().slice(0, 16),
      endDateTime: schedule.endDateTime.toISOString().slice(0, 16),
      placeName: schedule.placeName,
      address: schedule.address,
      roadAddress: schedule.roadAddress,
      latitude: schedule.latitude,
      longitude: schedule.longitude,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('일정을 삭제하시겠습니까?')) {
      try {
        await deleteSchedule(id);
        showToast('일정이 삭제되었습니다.');
      } catch (error) {
        console.error('Error deleting schedule:', error);
        alert('일정 삭제에 실패했습니다.');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      startDateTime: '',
      endDateTime: '',
      placeName: '',
      address: '',
      roadAddress: '',
      latitude: 0,
      longitude: 0,
    });
    setSelectedAddress(null);
  };

  if (loading) {
    return <div className="text-slate-900">로딩 중...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-emerald-500 rounded-full"></span> 행사 일정 구성
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-6 py-3 rounded-2xl font-black transition-all ${showForm ? 'bg-slate-100 text-slate-500' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-100'}`}
        >
          {showForm ? '취소' : '일정 추가'}
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 mb-10">
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">일정명</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 outline-none transition-all font-bold"
                placeholder="예: 오리엔테이션"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">설명</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded text-slate-900"
                placeholder="일정 설명"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">시작 시간</label>
                <input
                  type="datetime-local"
                  value={formData.startDateTime}
                  onChange={(e) => setFormData({ ...formData, startDateTime: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">종료 시간</label>
                <input
                  type="datetime-local"
                  value={formData.endDateTime}
                  onChange={(e) => setFormData({ ...formData, endDateTime: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">장소</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.placeName}
                  readOnly
                  className="flex-1 p-2 border border-slate-300 rounded text-slate-900 bg-slate-100"
                  placeholder="주소 검색으로 선택"
                />
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                  검색
                </button>
              </div>
            </div>

            {selectedAddress && (
              <div className="bg-blue-50 p-3 rounded border border-blue-200 text-slate-900">
                <p className="font-semibold">{selectedAddress.name}</p>
                <p className="text-sm text-slate-700">{selectedAddress.address}</p>
                {selectedAddress.roadAddress && (
                  <p className="text-sm text-slate-600">{selectedAddress.roadAddress}</p>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                {editingId ? '수정' : '추가'}
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-slate-500 text-white py-2 rounded hover:bg-slate-600"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {schedules.length === 0 ? (
          <div className="text-center py-8 text-slate-600">등록된 일정이 없습니다.</div>
        ) : (
          schedules.map((schedule) => (
            <div key={schedule.id} className="border border-slate-100 p-6 rounded-[2rem] bg-white shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-black text-xl text-slate-900 tracking-tight">{schedule.title}</h4>
                  {schedule.description && (
                    <p className="text-sm text-slate-500 mt-1">{schedule.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(schedule)}
                    className="bg-amber-100 text-amber-600 px-4 py-2 rounded-xl hover:bg-amber-200 font-black text-xs transition-colors"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(schedule.id)}
                    className="bg-rose-100 text-rose-600 px-4 py-2 rounded-xl hover:bg-rose-200 font-black text-xs transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-slate-700">
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg font-bold">
                  <span className="text-slate-400">⏰</span>
                  {schedule.startDateTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} - {schedule.endDateTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg font-bold">
                  <span className="text-slate-400">📍</span>
                  {schedule.placeName}
                </div>
              </div>

              {schedule.address && (
                <div className="text-xs text-slate-400 mt-3 ml-1 font-medium">
                  {schedule.roadAddress || schedule.address}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showAddressModal && (
        <AddressSearchModal
          onSelect={handleAddressSelect}
          onClose={() => setShowAddressModal(false)}
        />
      )}

      {/* 토스트 알림 */}
      {toast.visible && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-sky-500 text-white px-8 py-4 rounded-2xl shadow-2xl font-black flex items-center gap-2 border border-sky-400">
            <span>📅</span> {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
