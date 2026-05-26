// components/calendar/ContentCalendar.tsx
'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import type { ContentPiece } from '@/lib/db/schema';

interface ContentCalendarProps {
  briefId: string;
  contentPieces: ContentPiece[];
  onScheduleUpdate?: (contentPieceId: string, date: Date, time: string) => void;
}

export default function ContentCalendar({
  briefId,
  contentPieces,
  onScheduleUpdate,
}: ContentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState<string>('');
  const [editTime, setEditTime] = useState<string>('10:00');

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getContentForDate = (day: number | null) => {
    if (!day) return [];
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const dateStr = date.toISOString().split('T')[0];

    return contentPieces.filter((piece) => {
      const pieceDate = new Date(piece.scheduleInfo.scheduledDate)
        .toISOString()
        .split('T')[0];
      return pieceDate === dateStr;
    });
  };

  const handleScheduleClick = (contentPiece: ContentPiece) => {
    setEditingId(contentPiece._id || null);
    setEditDate(
      new Date(contentPiece.scheduleInfo.scheduledDate)
        .toISOString()
        .split('T')[0]
    );
    setEditTime(contentPiece.scheduleInfo.scheduledTime);
  };

  const handleSaveSchedule = async (contentPieceId: string) => {
    if (!editDate) {
      toast.error('Select a date');
      return;
    }

    try {
      const response = await fetch('/api/content/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentPieceId,
          scheduledDate: new Date(editDate),
          scheduledTime: editTime,
          briefId,
        }),
      });

      if (!response.ok) throw new Error('Failed to schedule');

      toast.success('Post scheduled! 📅');
      onScheduleUpdate?.(
        contentPieceId,
        new Date(editDate),
        editTime
      );
      setEditingId(null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to schedule post');
    }
  };

  const monthName = currentDate.toLocaleString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  const draftCount = contentPieces.filter(
    (p) => p.scheduleInfo.status === 'draft'
  ).length;
  const scheduledCount = contentPieces.filter(
    (p) => p.scheduleInfo.status === 'scheduled'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-900">📅 Calendar</h2>
          <div className="flex gap-4 text-sm">
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded">
              📝 {draftCount} Draft
            </span>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded">
              ✓ {scheduledCount} Scheduled
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() =>
              setCurrentDate(
                new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth() - 1
                )
              )
            }
            className="btn-ghost text-sm"
          >
            ← Prev
          </button>

          <h3 className="text-lg font-semibold text-slate-900">
            {monthName}
          </h3>

          <button
            onClick={() =>
              setCurrentDate(
                new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth() + 1
                )
              )
            }
            className="btn-ghost text-sm"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="card p-6">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-center font-semibold text-sm text-slate-600"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => {
            const contentForDay = getContentForDate(day);
            const isToday =
              day &&
              new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                day
              ).toDateString() === new Date().toDateString();

            return (
              <div
                key={idx}
                className={`min-h-24 p-2 rounded border-2 ${
                  day === null
                    ? 'bg-slate-50'
                    : isToday
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 bg-white'
                }`}
              >
                {day && (
                  <div className="space-y-1">
                    <p
                      className={`text-sm font-semibold ${
                        isToday
                          ? 'text-blue-700'
                          : 'text-slate-600'
                      }`}
                    >
                      {day}
                    </p>

                    {contentForDay.map((content) => (
                      <div
                        key={content._id}
                        onClick={() => handleScheduleClick(content)}
                        className={`text-xs p-1 rounded cursor-pointer truncate ${
                          content.scheduleInfo.status === 'scheduled'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        }`}
                      >
                        {content.platform}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Editing Modal */}
      {editingId && (
        <div className="card p-6 bg-blue-50 border-2 border-blue-300">
          <h3 className="font-semibold text-slate-900 mb-4">
            Schedule Post
          </h3>

          <div className="space-y-4">
            {/* Date input */}
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="input-base"
              />
            </div>

            {/* Time input */}
            <div>
              <label className="block text-sm font-medium mb-2">Time</label>
              <input
                type="time"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                className="input-base"
              />
            </div>

            {/* Timezone info */}
            <div className="text-sm text-slate-600 bg-white p-2 rounded">
              <p className="font-medium">Timezone: Asia/Jakarta (UTC+7)</p>
              <p className="text-xs mt-1">
                Post will be scheduled for this time
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleSaveSchedule(editingId)}
                className="btn-primary flex-1"
              >
                ✓ Schedule
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="btn-ghost flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content List */}
      {contentPieces.length > 0 && (
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Posts Overview</h3>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {contentPieces.map((piece) => (
              <div
                key={piece._id}
                className={`p-3 rounded border flex items-center justify-between ${
                  piece.scheduleInfo.status === 'scheduled'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {piece.platform}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        piece.scheduleInfo.status === 'scheduled'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {piece.scheduleInfo.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1">
                    {piece.caption}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    📅{' '}
                    {new Date(
                      piece.scheduleInfo.scheduledDate
                    ).toLocaleDateString('id-ID')}{' '}
                    {piece.scheduleInfo.scheduledTime}
                  </p>
                </div>

                <button
                  onClick={() => handleScheduleClick(piece)}
                  className="btn-ghost text-sm whitespace-nowrap"
                >
                  ✎ Edit
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
