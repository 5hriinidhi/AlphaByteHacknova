import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
    { name: 'ADHD', value: 92, color: '#8884d8' }, // Purple
    { name: 'Hearing', value: 65, color: '#FFBB28' }, // Yellow
    { name: 'Visibility', value: 30, color: '#00C49F' }, // Green
];

export function SpecialNeedsAnalytics() {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">Inclusive Performance Tracking</h3>
                <p className="text-sm text-gray-500">Engagement by special needs category</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-center">
                <div className="h-[300px] flex-1 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} barSize={40}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="w-full lg:w-48 bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-4">Class Performance</h4>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Understood</span>
                                <span className="font-bold text-green-600">78%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }} />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Confused</span>
                                <span className="font-bold text-red-600">22%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-red-500 h-2 rounded-full" style={{ width: '22%' }} />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <p className="text-xs text-center text-gray-500">
                                Average based on recent sessions
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
