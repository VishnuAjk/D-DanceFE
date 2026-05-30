'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchStudentProfileAttendance, fetchStudentProfiles } from '@/lib/portal-api';
import type { PortalAttendanceRecord, StudentProfile } from '@/types/portal';

function thisMonth() {
  return new Date().toISOString().slice(0, 7);
}

function startWeekday(year: number, monthIndex: number) {
  return new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
}

function daysInMonth(year: number, monthIndex: number) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function labelDay(value: number) {
  return String(value).padStart(2, '0');
}

function readStatusByDate(records: PortalAttendanceRecord[]) {
  const map = new Map<string, PortalAttendanceRecord['status']>();
  records.forEach((record) => map.set(record.date, record.status));
  return map;
}

export default function CustomerAttendancePage() {
  const studentProfilesQuery = useQuery({
    queryKey: ['portal-student-profiles'],
    queryFn: fetchStudentProfiles
  });

  const [studentProfileId, setStudentId] = useState('');
  const [month, setMonth] = useState(thisMonth());

  const studentProfileOptions = (studentProfilesQuery.data ?? []) as StudentProfile[];
  const selectedStudentId = studentProfileId || studentProfileOptions[0]?._id || '';

  const attendanceQuery = useQuery({
    queryKey: ['portal-attendance', selectedStudentId, month],
    queryFn: () => fetchStudentProfileAttendance({ studentProfileId: selectedStudentId, month }),
    enabled: Boolean(selectedStudentId && month)
  });

  const records = attendanceQuery.data ?? [];
  const statusByDate = useMemo(() => readStatusByDate(records), [records]);

  const [year, monthValue] = month.split('-').map((value) => Number(value));
  const monthIndex = (monthValue || 1) - 1;
  const offset = startWeekday(year, monthIndex);
  const totalDays = daysInMonth(year, monthIndex);
  const slots = Math.ceil((offset + totalDays) / 7) * 7;

  return (
    <main className="family-page">
      <section className="admin-page__header">
        <div>
          <p className="dashboard__eyebrow">Attendance</p>
          <h1 className="admin-page__title">Track attendance by month.</h1>
          <p className="dashboard__text">Select a student, then review each day’s attendance status.</p>
        </div>
        <div className="admin-panel__actions">
          <Link className="button button--ghost" href="/portal/dashboard">
            Back to dashboard
          </Link>
        </div>
      </section>

      <section className="admin-panel stack">
        <div className="admin-form-grid">
          <div className="field">
            <label className="field__label" htmlFor="student">
              Student
            </label>
            <select
              id="student"
              className="field__input"
              value={selectedStudentId}
              onChange={(event) => setStudentId(event.target.value)}
              disabled={studentProfilesQuery.isLoading || !studentProfileOptions.length}
            >
              {studentProfileOptions.length ? (
                studentProfileOptions.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name}
                  </option>
                ))
              ) : (
                <option value="">No student profiles</option>
              )}
            </select>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="month">
              Month
            </label>
            <input
              id="month"
              className="field__input"
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
            />
          </div>
        </div>

        {attendanceQuery.isLoading ? <p className="dashboard__text">Loading attendance...</p> : null}
      </section>

      <section className="admin-panel">
        <div className="calendar-grid" role="grid" aria-label="Monthly attendance calendar">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => (
            <div className="calendar-grid__header" role="columnheader" key={label}>
              {label}
            </div>
          ))}

          {Array.from({ length: slots }).map((_, slotIndex) => {
            const day = slotIndex - offset + 1;
            const inMonth = day >= 1 && day <= totalDays;

            if (!inMonth) {
              return <div className="calendar-cell calendar-cell--empty" role="gridcell" key={slotIndex} />;
            }

            const dateKey = `${month}-${labelDay(day)}`;
            const status = statusByDate.get(dateKey);
            const className = status
              ? `calendar-cell calendar-cell--${status.toLowerCase()}`
              : 'calendar-cell calendar-cell--none';

            return (
              <div
                className={className}
                role="gridcell"
                key={slotIndex}
                aria-label={`${dateKey} ${status ?? 'No record'}`}
              >
                <span className="calendar-cell__day">{day}</span>
              </div>
            );
          })}
        </div>

        <div className="calendar-legend" aria-label="Attendance legend">
          <span className="calendar-legend__item">
            <span className="calendar-dot calendar-dot--present" /> Present
          </span>
          <span className="calendar-legend__item">
            <span className="calendar-dot calendar-dot--late" /> Late
          </span>
          <span className="calendar-legend__item">
            <span className="calendar-dot calendar-dot--absent" /> Absent
          </span>
          <span className="calendar-legend__item">
            <span className="calendar-dot calendar-dot--none" /> No record
          </span>
        </div>
      </section>
    </main>
  );
}
