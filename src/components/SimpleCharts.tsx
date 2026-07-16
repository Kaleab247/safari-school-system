// src/components/SimpleChart.tsx
import React from 'react';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface SimpleChartProps {
  data: ChartData[];
  title?: string;
  height?: number;
}

export function SimpleBarChart({ data, title, height = 200 }: SimpleChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-center text-slate-400 py-8">No data available</div>;
  }

  const maxValue = Math.max(...data.map(d => Math.abs(d.value || 0)), 1);

  return (
    <div className="w-full">
      {title && <h3 className="font-semibold text-slate-900 mb-4">{title}</h3>}
      <div className="space-y-2" style={{ height: `${height}px`, overflowY: 'auto' }}>
        {data.map((item, index) => {
          const percentage = Math.abs((item.value / maxValue) * 100);
          const isNegative = item.value < 0;

          return (
            <div key={index} className="flex items-center gap-2">
              <span className="text-sm text-slate-600 w-24 truncate flex-shrink-0">{item.label}</span>
              <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isNegative ? 'bg-red-500' : 'bg-emerald-500'
                  }`}
                  style={{
                    width: `${Math.min(percentage, 100)}%`,
                    backgroundColor: item.color || (isNegative ? '#EF4444' : '#10B981')
                  }}
                />
              </div>
              <span className={`text-sm font-semibold w-12 text-right flex-shrink-0 ${
                isNegative ? 'text-red-600' : 'text-emerald-600'
              }`}>
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SimplePieChart({ data, title }: SimpleChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-center text-slate-400 py-8">No data available</div>;
  }

  const total = data.reduce((sum, d) => sum + Math.abs(d.value || 0), 0);
  const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

  return (
    <div className="w-full">
      {title && <h3 className="font-semibold text-slate-900 mb-4">{title}</h3>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          {data.map((item, index) => {
            const percentage = total > 0 ? ((Math.abs(item.value) / total) * 100).toFixed(1) : 0;
            return (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color || colors[index % colors.length] }}
                />
                <span className="text-sm text-slate-600 flex-1">{item.label}</span>
                <span className="text-sm font-semibold text-slate-700">
                  {percentage}%
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            {data.map((item, index) => {
              const percentage = total > 0 ? (Math.abs(item.value) / total) * 100 : 0;
              const startAngle = data.slice(0, index).reduce((sum, d) => sum + ((Math.abs(d.value) / total) * 360), 0);
              const endAngle = startAngle + (percentage * 360) / 100;

              return (
                <div
                  key={index}
                  className="absolute inset-0"
                  style={{
                    background: `conic-gradient(
                      ${item.color || colors[index % colors.length]} ${startAngle}deg ${endAngle}deg
                    )`,
                    borderRadius: '50%',
                    clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos(startAngle * Math.PI / 180)}% ${50 + 50 * Math.sin(startAngle * Math.PI / 180)}%, ${50 + 50 * Math.cos(endAngle * Math.PI / 180)}% ${50 + 50 * Math.sin(endAngle * Math.PI / 180)}%)`
                  }}
                />
              );
            })}
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-slate-600">Total</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SimpleLineChart({ data, title }: SimpleChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-center text-slate-400 py-8">No data available</div>;
  }

  const maxValue = Math.max(...data.map(d => Math.abs(d.value || 0)), 1);
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: 100 - ((Math.abs(d.value) / maxValue) * 90 + 5)
  }));

  const pathData = points.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ');

  return (
    <div className="w-full">
      {title && <h3 className="font-semibold text-slate-900 mb-4">{title}</h3>}
      <div className="relative h-48 bg-white rounded-lg p-4">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="#e2e8f0"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
          ))}

          {/* Data line */}
          <polyline
            points={pathData}
            fill="none"
            stroke="#10B981"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="2"
              fill="#10B981"
              stroke="white"
              strokeWidth="1"
            />
          ))}
        </svg>

        {/* Labels */}
        <div className="flex justify-between mt-2">
          {data.map((d, i) => (
            <span key={i} className="text-xs text-slate-500 truncate" style={{ width: `${100 / data.length}%` }}>
              {d.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}