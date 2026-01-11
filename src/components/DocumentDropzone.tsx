import { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, Loader2, AlertCircle } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Use Vite's URL import for the worker script
// This ensures the worker is bundled/copied correctly by Vite
const workerUrl = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

interface DocumentDropzoneProps {
    onTextExtracted: (text: string) => void;
}

export function DocumentDropzone({ onTextExtracted }: DocumentDropzoneProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const processFile = async (file: File) => {
        setIsProcessing(true);
        setError(null);

        try {
            if (file.type === 'application/pdf') {
                await processPdf(file);
            } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                await processDocx(file);
            } else {
                setError('Unsupported file type. Please upload PDF or DOCX.');
            }
        } catch (err: any) {
            console.error('File processing error:', err);
            setError('Failed to read document. ' + (err.message || ''));
        } finally {
            setIsProcessing(false);
        }
    };

    const processPdf = async (file: File) => {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');
            fullText += pageText + '\n\n';
        }

        if (fullText.trim().length === 0) {
            throw new Error('No text found in PDF (it might be an image).');
        }

        onTextExtracted(fullText);
    };

    const processDocx = async (file: File) => {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });

        if (result.value.trim().length === 0) {
            throw new Error('No text found in Word document.');
        }

        onTextExtracted(result.value);
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    };

    return (
        <div
            className={`border-2 border-dashed rounded-xl p-8 mb-8 text-center transition-colors cursor-pointer
        ${isDragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
        >
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.docx"
                onChange={handleFileSelect}
            />

            <div className="flex flex-col items-center justify-center space-y-3">
                {isProcessing ? (
                    <>
                        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                        <p className="text-sm font-medium text-gray-700">Extracting text...</p>
                    </>
                ) : (
                    <>
                        <div className={`p-4 rounded-full ${isDragOver ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                            <Upload className={`w-8 h-8 ${isDragOver ? 'text-indigo-600' : 'text-gray-500'}`} />
                        </div>

                        <div className="space-y-1">
                            <p className="text-base font-semibold text-gray-900">
                                Drag & Drop Reading Material
                            </p>
                            <p className="text-sm text-gray-500">
                                Supports PDF and DOCX files
                            </p>
                        </div>
                    </>
                )}

                {error && (
                    <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg mt-4">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
