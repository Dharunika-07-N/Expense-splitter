import { useRef } from 'react';
import { Download, Upload, Trash2, ShieldAlert, Palette, Bell, Globe } from 'lucide-react';
import { useApp } from '../../../hooks/useApp';
import { Button, Card } from '../../ui/BaseUI';
import { storage } from '../../../utils/storage';

export default function Settings() {
    const { clearAllData, settings, updateSettings } = useApp();
    const fileInputRef = useRef(null);

    const handleExport = () => {
        const data = storage.exportAll();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nexsplit_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (storage.importAll(data)) {
                    alert('Data imported successfully! The app will now reload.');
                    window.location.reload();
                } else {
                    alert('Failed to import data. Please check the file format.');
                }
            } catch {
                alert('Invalid JSON file.');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Settings</h2>
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-1">Preferences and data management</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Data Management */}
                <Card className="flex flex-col dark:bg-slate-900 border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl">
                            <ShieldAlert size={20} />
                        </div>
                        <h3 className="text-xl font-black dark:text-white">Data & Backup</h3>
                    </div>

                    <div className="space-y-4 flex-1">
                        <p className="text-sm font-bold text-slate-400 leading-relaxed">
                            Backup your data to a JSON file or restore from a previous backup. All your local data stays on your device.
                        </p>

                        <div className="flex flex-col gap-3 pt-4">
                            <Button variant="secondary" onClick={handleExport} className="justify-start dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                                <Download size={18} />
                                Export Backup (JSON)
                            </Button>
                            <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="justify-start dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                                <Upload size={18} />
                                Import Backup (JSON)
                            </Button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImport}
                                className="hidden"
                                accept=".json"
                            />
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800">
                        <Button
                            variant="danger"
                            className="w-full justify-start"
                            onClick={() => {
                                if (confirm('WARNING: This will permanently delete ALL your data. Are you sure?')) {
                                    clearAllData();
                                }
                            }}
                        >
                            <Trash2 size={18} />
                            Reset All Data
                        </Button>
                    </div>
                </Card>

                {/* Preferences */}
                <Card className="flex flex-col dark:bg-slate-900 border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl">
                            <Palette size={20} />
                        </div>
                        <h3 className="text-xl font-black dark:text-white">Preferences</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <Globe size={18} className="text-slate-400" />
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Default Currency</span>
                            </div>
                            <span className="text-xs font-black text-slate-900 dark:text-white bg-white dark:bg-slate-700 px-3 py-1.5 rounded-lg shadow-sm">INR (₹)</span>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl cursor-not-allowed opacity-50">
                            <div className="flex items-center gap-3">
                                <Bell size={18} className="text-slate-400" />
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Notifications</span>
                            </div>
                            <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 rounded-full relative">
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white dark:bg-slate-400 rounded-full"></div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <Palette size={18} className="text-slate-400" />
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">App Theme</span>
                            </div>
                            <button
                                onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
                                className="text-xs font-black text-slate-900 dark:text-white bg-white dark:bg-slate-700 px-3 py-1.5 rounded-lg shadow-sm border border-slate-100 dark:border-slate-600 transition-all active:scale-95"
                            >
                                {settings.theme === 'dark' ? 'Dark' : 'Light'}
                            </button>
                        </div>
                    </div>

                    <div className="mt-auto pt-8">
                        <div className="p-4 bg-blue-600 rounded-3xl text-white">
                            <h4 className="font-black mb-1">NexSplit Pro</h4>
                            <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mb-3">Coming Soon</p>
                            <p className="text-xs text-blue-50 leading-relaxed mb-4">Cloud sync, receipts scanning, and advanced analytics.</p>
                            <Button size="sm" variant="ghost" className="bg-white/10 hover:bg-white/20 text-white w-full">Learn More</Button>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="text-center pt-10">
                <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">NexSplit v2.1.0 • Built with ❤️ for Group Finance</p>
            </div>
        </div>
    );
}
