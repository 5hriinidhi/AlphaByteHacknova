import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

interface TutorialStep {
    target: string;
    title: string;
    description: string;
    position: 'top' | 'bottom' | 'left' | 'right';
}

interface TutorialOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

const steps: TutorialStep[] = [
    {
        target: '[data-tour="toolbar"]',
        title: 'Adaptive Toolbar',
        description: 'Customize your learning experience here. Adjust font size, enable screen readers, and more.',
        position: 'bottom'
    },
    {
        target: '[data-tour="navigation"]',
        title: 'Navigation',
        description: 'Switch between your Dashboard and Learning Content easily.',
        position: 'bottom'
    },
    {
        target: '[data-tour="content"]',
        title: 'Main Content',
        description: 'This is where you will see your lessons, assignments, and progress reports.',
        position: 'top'
    },
    {
        target: '[data-tour="unibuddy"]',
        title: 'UniBuddy',
        description: 'Need help? Chat with UniBuddy anytime for assistance with your studies.',
        position: 'left'
    }
];

export function TutorialOverlay({ isOpen, onClose }: TutorialOverlayProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        if (isOpen) {
            setCurrentStep(0);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            const step = steps[currentStep];
            const element = document.querySelector(step.target);
            if (element) {
                const rect = element.getBoundingClientRect();
                setTargetRect(rect);
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [isOpen, currentStep]);

    if (!isOpen || !targetRect) return null;

    const step = steps[currentStep];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-50 pointer-events-none">
            {/* Dark Overlay with cutout */}
            <div className="absolute inset-0 bg-black/50 transition-all duration-300" style={{
                clipPath: `polygon(
          0% 0%, 
          0% 100%, 
          100% 100%, 
          100% 0%, 
          ${targetRect.left}px 0%, 
          ${targetRect.left}px ${targetRect.top}px, 
          ${targetRect.right}px ${targetRect.top}px, 
          ${targetRect.right}px ${targetRect.bottom}px, 
          ${targetRect.left}px ${targetRect.bottom}px, 
          ${targetRect.left}px 0%
        )`
            }} />

            {/* Highlight Box Border */}
            <div
                className="absolute border-4 border-blue-500 rounded-lg transition-all duration-300"
                style={{
                    top: targetRect.top - 4,
                    left: targetRect.left - 4,
                    width: targetRect.width + 8,
                    height: targetRect.height + 8,
                }}
            />

            {/* Tooltip Card */}
            <div
                className="absolute pointer-events-auto bg-white rounded-xl shadow-2xl p-6 w-80 transition-all duration-300"
                style={{
                    top: step.position === 'bottom' ? targetRect.bottom + 20 :
                        step.position === 'top' ? targetRect.top - 200 :
                            targetRect.top,
                    left: step.position === 'left' ? targetRect.left - 340 :
                        step.position === 'right' ? targetRect.right + 20 :
                            targetRect.left,
                }}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-4">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                        Step {currentStep + 1} of {steps.length}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mt-1">{step.title}</h3>
                    <p className="text-gray-600 mt-2 text-sm leading-relaxed">
                        {step.description}
                    </p>
                </div>

                <div className="flex items-center justify-between mt-6">
                    <button
                        onClick={handlePrev}
                        disabled={currentStep === 0}
                        className={`flex items-center gap-1 text-sm font-medium ${currentStep === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                    </button>

                    <button
                        onClick={handleNext}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-sm hover:shadow-md"
                    >
                        {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                        {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
