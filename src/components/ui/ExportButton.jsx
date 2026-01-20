import html2canvas from 'html2canvas';
import { Download, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from './BaseUI';

export default function ExportButton({ targetRef }) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        if (!targetRef.current || isExporting) return;

        setIsExporting(true);
        try {
            // Wait a tiny bit for any animations to settle
            await new Promise(resolve => setTimeout(resolve, 300));

            const isDark = document.documentElement.classList.contains('dark');
            const canvas = await html2canvas(targetRef.current, {
                backgroundColor: isDark ? '#020617' : '#f8fafc',
                scale: 3, // High resolution for premium look
                logging: false,
                useCORS: true,
                borderRadius: 24,
                ignoreElements: (element) => {
                    // Ignore buttons and interactive elements in the export
                    return element.tagName === 'BUTTON' || element.classList.contains('no-export');
                }
            });

            const link = document.createElement('a');
            link.download = `NexSplit-Export-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Export failed', error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Button
            onClick={handleExport}
            variant="secondary"
            size="md"
            className={`rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none min-w-[160px] ${isExporting ? 'cursor-wait opacity-80' : ''}`}
            disabled={isExporting}
        >
            {isExporting ? (
                <>
                    <Loader2 size={18} className="animate-spin text-blue-500" />
                    Generating...
                </>
            ) : (
                <>
                    <ImageIcon size={18} className="text-blue-500" />
                    Share Snapshot
                </>
            )}
        </Button>
    );
}
