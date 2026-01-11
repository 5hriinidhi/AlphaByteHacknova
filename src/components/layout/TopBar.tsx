import { Search, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function TopBar() {
    const { logout } = useAuth();

    return (
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
            <div className="flex-1 max-w-xl">
                <div className="relative">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search for anything..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-gray-600 focus:ring-2 focus:ring-[#2D3091]/20 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 border-r border-gray-100 pr-6">
                </div>

                <div className="flex items-center gap-3 pl-2">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-semibold text-gray-900">Shrinidhi</p>
                        <p className="text-xs text-gray-500">Administrator</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#2D3091] text-white flex items-center justify-center font-bold text-lg">
                        S
                    </div>
                    <button
                        onClick={() => logout()}
                        className="p-2 hover:bg-gray-50 rounded-full transition-colors group"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                    </button>
                </div>
            </div>
        </header>
    );
}
