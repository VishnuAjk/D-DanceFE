'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchChildAttendance, fetchChildren } from '@/lib/parent-api';
import type { ParentAttendanceRecord, ParentChild } from '@/types/parent';

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

function readStatusByDate(records: ParentAttendanceRecord[]) {
  const map = new Map<string, ParentAttendanceRecord['status']>();
  records.forEach((record) => map.set(record.date, record.status));
  return map;
}

export default function ParentAttendancePage() {
  const childrenQuery = useQuery({
    queryKey: ['parent-children'],
    queryFn: fetchChildren
  });

  const [childId, setChildId] = useState('');
  const [month, setMonth] = useState(thisMonth());

  const childOptions = (childrenQuery.data ?? []) as ParentChild[];
  const selectedChildId = childId || childOptions[0]?._id || '';

  const attendanceQuery = useQuery({
    queryKey: ['parent-attendance', selectedChildId, month],
    queryFn: () => fetchChildAttendance({ childId: selectedChildId, month }),
    enabled: Boolean(selectedChildId && month)
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
          <p className="dashboard__text">Select a child, then review each day’s attendance status.</p>
        </div>
        <div className="admin-panel__actions">
          <Link className="button button--ghost" href="/parent/dashboard">
            Back to dashboard
          </Link>
        </div>
      </section>

      <section className="admin-panel stack">
        <div className="admin-form-grid">
          <div className="field">
            <label className="field__label" htmlFor="child">
              Child
            </label>
            <select
              id="child"
              className="field__input"
              value={selectedChildId}
              onChange={(event) => setChildId(event.target.value)}
              disabled={childrenQuery.isLoading || !childOptions.length}
            >
              {childOptions.length ? (
                childOptions.map((child) => (
                  <option key={child._id} value={child._id}>
                    {child.name}
                  </option>
                ))
              ) : (
                <option value="">No child profiles</option>
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
