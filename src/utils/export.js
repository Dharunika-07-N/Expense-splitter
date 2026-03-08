import html2canvas from 'html2canvas';

export async function exportSettlementCard(elementRef, filename = 'nexsplit-settlement') {
    const canvas = await html2canvas(elementRef.current, {
        scale: 3,              // 3x resolution — crisp on retina
        useCORS: true,
        backgroundColor: null, // transparent bg
        logging: false,
    });

    // Option B: Web Share API (mobile native share sheet)
    if (navigator.share) {
        try {
            const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
            const file = new File([blob], `${filename}.png`, { type: 'image/png' });
            await navigator.share({ files: [file], title: 'NexSplit Settlement' });
            return;
        } catch (e) {
            console.warn('Sharing failed, falling back to download', e);
        }
    }

    // Option A: Download
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}
