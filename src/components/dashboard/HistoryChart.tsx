import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface HistoryChartProps {
  title: string;
  data: number[];
  color: string;
  gradientId: string;
  unit: string;
  decimals?: number;
}

export function HistoryChart({
  title,
  data,
  color,
  gradientId,
  unit,
  decimals = 1
}: HistoryChartProps) {
  const chartData = useMemo(() => {
    return data.map((value, index) => ({
      index,
      value: Number(value.toFixed(decimals)),
      time: `${60 - index}m ago`
    }));
  }, [data, decimals]);

  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  const avgValue = data.reduce((a, b) => a + b, 0) / data.length;
  const range = maxValue - minValue;
  const padding = range * 0.1 || 1;

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex gap-4 text-xs font-mono text-muted-foreground">
          <span>Min: {minValue.toFixed(decimals)}{unit}</span>
          <span>Avg: {avgValue.toFixed(decimals)}{unit}</span>
          <span>Max: {maxValue.toFixed(decimals)}{unit}</span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="50%" stopColor={color} stopOpacity={0.15} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="rgba(255,255,255,0.05)" 
            vertical={false}
          />
          
          <XAxis 
            dataKey="index"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => value % 10 === 0 ? `${60 - value}m` : ''}
          />
          
          <YAxis 
            domain={[minValue - padding, maxValue + padding]}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => value.toFixed(decimals)}
            width={50}
          />
          
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)'
            }}
            labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
            formatter={(value: number) => [`${value}${unit}`, title]}
            labelFormatter={(index) => `${60 - index} minutes ago`}
          />
          
          <ReferenceLine 
            y={avgValue} 
            stroke={color} 
            strokeDasharray="5 5" 
            strokeOpacity={0.5}
          />
          
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            animationDuration={500}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      <div className="text-xs text-muted-foreground mt-2 text-center">
        Last 60 samples (1 sample/minute)
      </div>
    </div>
  );
}
