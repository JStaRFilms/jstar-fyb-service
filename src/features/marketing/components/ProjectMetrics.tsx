import { LucideIcon, Layers, Zap, BarChart3, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Metric {
  label: string;
  value: string;
  icon: LucideIcon;
  colorClass: string;
}

interface ProjectMetricsProps {
  metrics: {
    codeQuality: number;
    performance: string;
    testCoverage?: number;
  };
  className?: string;
}

export function ProjectMetrics({ metrics, className }: ProjectMetricsProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-4", className)}>
      <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between h-32 group hover:bg-white/5 transition-colors border border-white/5 bg-white/5 backdrop-blur-md">
        <Layers className="w-6 h-6 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
        <div>
          <div className="text-3xl font-display font-bold text-white mb-1">{metrics.codeQuality}/100</div>
          <div className="text-[10px] md:text-xs text-gray-400 font-mono tracking-wider">CODE QUALITY SCORE</div>
        </div>
      </div>
      
      <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between h-32 group hover:bg-white/5 transition-colors border border-white/5 bg-white/5 backdrop-blur-md">
        <Zap className="w-6 h-6 text-yellow-400 mb-2 group-hover:scale-110 transition-transform" />
        <div>
          <div className="text-3xl font-display font-bold text-white mb-1">{metrics.performance}</div>
          <div className="text-[10px] md:text-xs text-gray-400 font-mono tracking-wider">AVG LOAD TIME</div>
        </div>
      </div>
    </div>
  );
}
