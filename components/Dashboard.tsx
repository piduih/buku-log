import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { LogEntry, Logbook, TimeFilter } from '../types';
import { DownloadIcon } from './Icons';

interface DashboardProps {
  entries: LogEntry[];
  logbooks: Logbook[];
}

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#ef4444'];

const dateFilters: { label: string; value: TimeFilter }[] = [
  { label: 'Hari Ini', value: 'today' },
  { label: 'Minggu Ini', value: 'week' },
  { label: 'Bulan Ini', value: 'month' },
  { label: 'Tahun Ini', value: 'year' },
  { label: 'Semua', value: 'all' },
];

const filterEntriesByDate = (entries: LogEntry[], filter: TimeFilter): LogEntry[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (filter) {
    case 'today':
      return entries.filter(e => new Date(e.date).toDateString() === today.toDateString());
    case 'week':
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      return entries.filter(e => new Date(e.date) >= startOfWeek);
    case 'month':
      return entries.filter(e => {
        const entryDate = new Date(e.date);
        return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
      });
    case 'year':
      return entries.filter(e => new Date(e.date).getFullYear() === now.getFullYear());
    case 'all':
    default:
      return entries;
  }
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }).format(amount);
}

const Dashboard: React.FC<DashboardProps> = ({ entries, logbooks }) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');

  const logbookMap = useMemo(() => {
    return new Map(logbooks.map(lb => [lb.id, lb.name]));
  }, [logbooks]);

  const filteredData = useMemo(() => {
    const filteredEntries = filterEntriesByDate(entries, timeFilter);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const totalExpense = filteredEntries.reduce((sum, entry) => sum + ((entry.type === 'income') ? 0 : entry.cost), 0);
    const totalIncome = filteredEntries.reduce((sum, entry) => sum + ((entry.type === 'income') ? entry.cost : 0), 0);
    
      // Breakdown currently shows per-logbook expenses only
      const breakdown = filteredEntries.reduce((acc, entry) => {
      if (!acc[entry.logbookId]) {
        acc[entry.logbookId] = 0;
      }
      // Only count as expense for the pie breakdown
      acc[entry.logbookId] += (entry.type === 'income') ? 0 : entry.cost;
      return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(breakdown)
        .map(([logbookId, value]) => ({
            name: logbookMap.get(logbookId) || 'Unknown',
            value,
        }))
        .sort((a, b) => b.value - a.value);

    const net = totalIncome - totalExpense;
    // Build time series for the trend chart
    const buildTimeSeries = () => {
      const parseD = (d: string) => new Date(d + 'T00:00:00');

      const labels: string[] = [];
      const counts: Record<string, { income: number; expense: number }> = {};

        if (timeFilter === 'week') {
        const start = new Date(today);
        start.setDate(start.getDate() - start.getDay());
        for (let i = 0; i < 7; i++) {
          const d = new Date(start);
          d.setDate(start.getDate() + i);
          const key = d.toLocaleDateString(undefined, { weekday: 'short' });
          labels.push(key);
          counts[key] = { income: 0, expense: 0 };
        }
      } else if (timeFilter === 'month') {
        const nowMonth = now.getMonth();
        const year = now.getFullYear();
        const days = new Date(year, nowMonth + 1, 0).getDate();
        for (let day = 1; day <= days; day++) {
          const key = String(day);
          labels.push(key);
          counts[key] = { income: 0, expense: 0 };
        }
      } else if (timeFilter === 'year') {
        const months = [...Array(12)].map((_, i) => new Date(now.getFullYear(), i, 1));
        months.forEach(m => {
          const key = m.toLocaleDateString(undefined, { month: 'short' });
          labels.push(key);
          counts[key] = { income: 0, expense: 0 };
        });
      } else {
        // all - bucket by YYYY-MM
        const dates = filteredEntries.map(e => e.date).sort();
        if (dates.length > 0) {
          const start = new Date(dates[0] + 'T00:00:00');
          const end = new Date(dates[dates.length - 1] + 'T00:00:00');
          let cur = new Date(start.getFullYear(), start.getMonth(), 1);
          while (cur <= end) {
            const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`;
            labels.push(key);
            counts[key] = { income: 0, expense: 0 };
            cur.setMonth(cur.getMonth() + 1);
          }
        }
      }

      // fill counts
      filteredEntries.forEach(entry => {
        let key: string;
        const d = new Date(entry.date + 'T00:00:00');
        if (timeFilter === 'week') key = d.toLocaleDateString(undefined, { weekday: 'short' });
        else if (timeFilter === 'month') key = String(d.getDate());
        else if (timeFilter === 'year') key = d.toLocaleDateString(undefined, { month: 'short' });
        else key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

        if (!counts[key]) counts[key] = { income: 0, expense: 0 };
        if (entry.type === 'income') counts[key].income += entry.cost;
        else counts[key].expense += entry.cost;
      });

      return labels.map(l => ({ name: l, income: counts[l]?.income || 0, expense: counts[l]?.expense || 0 }));
    };

    const timeSeries = buildTimeSeries();

    // Build breakdowns by logbook for incomes and expenses separately
    const incomeBreakdown: Record<string, number> = {};
    const expenseBreakdown: Record<string, number> = {};

    filteredEntries.forEach(entry => {
      if (entry.type === 'income') {
        incomeBreakdown[entry.logbookId] = (incomeBreakdown[entry.logbookId] || 0) + entry.cost;
      } else {
        expenseBreakdown[entry.logbookId] = (expenseBreakdown[entry.logbookId] || 0) + entry.cost;
      }
    });

    const incomeChartData = Object.entries(incomeBreakdown).map(([id, value]) => ({ name: logbookMap.get(id) || 'Unknown', value }));
    const expenseChartData = Object.entries(expenseBreakdown).map(([id, value]) => ({ name: logbookMap.get(id) || 'Unknown', value }));

    return { totalExpense, totalIncome, net, chartData, timeSeries, incomeChartData, expenseChartData };
  }, [entries, timeFilter, logbookMap]);
  
  const handleExportCSV = () => {
    const headers = ['ID Rekod', 'ID Buku Log', 'Nama Buku Log', 'Tajuk', 'Tarikh', 'Masa', 'Jenis', 'Jumlah', 'Nota'];
    
    const rows = entries.map(entry => {
        const logbookName = logbookMap.get(entry.logbookId) || 'Tidak Diketahui';
        const escapeCSV = (field: string | undefined) => {
            if (!field) return '';
            // Escape double quotes and wrap in double quotes if it contains commas, double quotes, or newlines
            if (/[",\n]/.test(field)) {
                return `"${field.replace(/"/g, '""')}"`;
            }
            return field;
        };
        
        const typeLabel = entry.type === 'income' ? 'Pendapatan' : 'Perbelanjaan';
        return [
            entry.id,
            entry.logbookId,
            escapeCSV(logbookName),
            escapeCSV(entry.title),
            entry.date,
            entry.time,
            typeLabel,
            entry.cost,
            escapeCSV(entry.notes)
        ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `buku-log-pak-long-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-wrap gap-2">
        {dateFilters.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setTimeFilter(value)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors min-h-[2.5rem] flex items-center justify-center ${
              timeFilter === value
                ? 'bg-primary text-white shadow-lg'
                : 'bg-surface text-text-secondary hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-surface rounded-xl p-6 shadow-md border border-slate-200 space-y-2 text-center">
        <p className="text-muted text-lg">Jumlah (Pendapatan / Perbelanjaan)</p>
        <div className="flex flex-col gap-2">
          <div className="text-sm text-muted">Pendapatan</div>
          <div className="text-2xl font-semibold text-green-600">{formatCurrency(filteredData.totalIncome)}</div>
          <div className="text-sm text-muted">Perbelanjaan</div>
          <div className="text-2xl font-semibold text-red-600">{formatCurrency(filteredData.totalExpense)}</div>
          <div className="text-sm text-muted">Baki</div>
          <div className={`text-3xl font-bold ${filteredData.net >= 0 ? 'text-green-700' : 'text-red-700'}`}>{formatCurrency(filteredData.net)}</div>
        </div>
      </div>

      <div className="bg-surface rounded-xl p-6 shadow-md border border-slate-200">
        {/* Trend chart: Income vs Expense over time */}
        <h3 className="text-xl font-bold text-text-primary mb-4">Tren (Pendapatan vs Perbelanjaan)</h3>
        <div className="w-full h-44">
          <ResponsiveContainer>
            <LineChart data={filteredData.timeSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(v) => formatCurrency(v as number)} />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-text-primary">Pecahan Laporan</h3>
          <button onClick={handleExportCSV} className="flex items-center gap-1.5 text-sm text-primary font-semibold p-2 rounded-lg hover:bg-primary/10 transition-colors">
            <DownloadIcon className="w-4 h-4" />
            <span>Eksport CSV</span>
          </button>
        </div>
        {(filteredData.expenseChartData.length > 0 || filteredData.incomeChartData.length > 0) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="w-full">
              <h4 className="text-md font-medium mb-2">Pecahan Perbelanjaan</h4>
              {filteredData.expenseChartData.length > 0 ? (
              <div className="space-y-2">
                <div className="w-full h-56">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={filteredData.expenseChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={70}
                      innerRadius={36}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                    >
                      {filteredData.expenseChartData.map((entry, index) => (
                        <Cell key={`cell-exp-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                        {filteredData.expenseChartData.map((item, index) => (
                          <div key={item.name} className="flex justify-between items-center text-text-secondary">
                            <div className="flex items-center gap-3">
                              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                              <span className="font-medium text-text-primary">{item.name}</span>
                            </div>
                            <span className="font-semibold text-text-primary">{formatCurrency(item.value)}</span>
                          </div>
                        ))}
                </div>
              </div>
              ) : (
                <div className="text-muted">Tiada perbelanjaan untuk tempoh ini.</div>
              )}
            </div>

            <div className="w-full">
              <h4 className="text-md font-medium mb-2">Pecahan Pendapatan</h4>
              {filteredData.incomeChartData.length > 0 ? (
                <div className="space-y-2">
                  <div className="w-full h-56">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={filteredData.incomeChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={70}
                        innerRadius={36}
                        dataKey="value"
                        nameKey="name"
                      >
                        {filteredData.incomeChartData.map((entry, index) => (
                          <Cell key={`cell-inc-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                        {filteredData.incomeChartData.map((item, index) => (
                          <div key={item.name} className="flex justify-between items-center text-text-secondary">
                            <div className="flex items-center gap-3">
                              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                              <span className="font-medium text-text-primary">{item.name}</span>
                            </div>
                            <span className="font-semibold text-text-primary">{formatCurrency(item.value)}</span>
                          </div>
                        ))}
                  </div>
                </div>
              ) : (
                <div className="text-muted">Tiada pendapatan untuk tempoh ini.</div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-muted text-center py-8">Tiada data untuk tempoh ini.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;