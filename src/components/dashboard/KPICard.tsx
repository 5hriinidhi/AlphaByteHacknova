import { LucideIcon } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    color: string;
}

export function KPICard({ title, value, icon: Icon, trend, color }: KPICardProps) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>

                    {trend && (
                        <div className={`flex items-center gap-1 mt-2 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'
                            }`}>
                            <span>{trend.value}</span>
                            <span className="text-gray-400">vs last month</span>
                        </div>
                    )}
                </div>

                <div className={`p-3 rounded-xl ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );
}
