import {
    LayoutDashboard,
    Users,
    GraduationCap,
    BookOpen
} from 'lucide-react';

interface SidebarProps {
    activeItem: string;
    onNavigate: (item: string) => void;
}

export function Sidebar({ activeItem, onNavigate }: SidebarProps) {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'students', label: 'Students', icon: Users },
        { id: 'content', label: 'Plan Lesson', icon: BookOpen },
    ];

    return (
        <div className="w-64 h-screen bg-[#2D3091] text-white flex flex-col fixed left-0 top-0 overflow-y-auto">
            <div className="p-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <span className="bg-white/10 p-1 rounded-lg">
                        <GraduationCap className="w-6 h-6" />
                    </span>
                    Saral Class
                </h1>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-200 ${activeItem === item.id
                            ? 'bg-white/10 text-white font-medium shadow-lg backdrop-blur-sm'
                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="p-4 mt-auto">
                <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-xs text-blue-200 mb-1">Storage Used</p>
                    <div className="w-full bg-white/10 rounded-full h-1.5 mb-2">
                        <div className="bg-blue-400 h-1.5 rounded-full w-[75%]" />
                    </div>
                    <p className="text-xs text-blue-200">75% of 100GB</p>
                </div>
            </div>
        </div>
    );
}
