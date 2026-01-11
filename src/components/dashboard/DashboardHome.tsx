
import { SpecialNeedsAnalytics } from './SpecialNeedsAnalytics';
import { TrendAnalysis } from './TrendAnalysis';
import { CourseList } from './CourseList';


interface DashboardHomeProps {
    onNavigate: (item: string) => void;
}

export function DashboardHome({ onNavigate }: DashboardHomeProps) {
    return (
        <div className="space-y-8">
            <CourseList onNavigate={onNavigate} />

            <div className="grid grid-cols-1 gap-8">
                {/* Main Analytics Area */}
                <div className="w-full space-y-8">
                    <SpecialNeedsAnalytics />
                    <TrendAnalysis />
                </div>
            </div>
        </div>
    );
}
