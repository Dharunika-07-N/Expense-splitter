import html2canvas from 'html2canvas';
import { Download, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';

export default function ExportButton({ targetRef }) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        if (!targetRef.current || isExporting) return;

        setIsExporting(true);
        try {
            const canvas = await html2canvas(targetRef.current, {
                backgroundColor: '#f8fafc',
                scale: 3, // High resolution
                logging: false,
                useCORS: true,
                borderRadius: 24,
            });

            const link = document.createElement('a');
            link.download = `expense-summary-${new Date().toLocaleDateString()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Export failed', error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            className={`px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg ${isExporting
                    ? 'bg-slate-200 text-slate-400 cursor-wait'
                    : 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50'
                }`}
        >
            {isExporting ? (
                <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                </span>
            ) : (
                <>
                    <ImageIcon size={20} className="text-blue-500" />
                    Share as Image
                </>
            )}
        </button>
    );
}
