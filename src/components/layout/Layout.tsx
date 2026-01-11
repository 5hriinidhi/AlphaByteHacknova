import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface LayoutProps {
    children: ReactNode;
    activeItem: string;
    onNavigate: (item: string) => void;
}

export function Layout({ children, activeItem, onNavigate }: LayoutProps) {
    return (
        <div className="min-h-screen bg-[#F3F4F9]">
            <Sidebar activeItem={activeItem} onNavigate={onNavigate} />

            <div className="pl-64 flex flex-col min-h-screen">
                <TopBar />

                <main className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-gray-900">Welcome to Saral Class (Teacher View)</h1>
                            <p className="text-gray-500 text-sm mt-1">Here's what's happening with your students today.</p>
                        </div>

                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
