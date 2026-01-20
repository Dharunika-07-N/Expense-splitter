import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Calculator, PieChart, Users, Wallet, Zap, Sparkles } from 'lucide-react';
import { Button } from './ui/BaseUI';

export default function Onboarding({ onComplete }) {
    const [step, setStep] = useState(0);

    const steps = [
        {
            title: "Welcome to NexSplit",
            description: "The most powerful way to split expenses and settle debts with friends, trips, and roommates.",
            icon: Calculator,
            color: "bg-blue-600",
            image: "✨"
        },
        {
            title: "Smart Split Engine",
            description: "Split by shares, percentages, or items. Our AI-optimized algorithm reduces the number of transfers needed.",
            icon: Zap,
            color: "bg-amber-500",
            image: "⚡"
        },
        {
            title: "Detailed Insights",
            description: "Visualize your spending patterns across groups and categories with beautiful interactive charts.",
            icon: PieChart,
            color: "bg-indigo-600",
            image: "📊"
        },
        {
            title: "Ready to Start?",
            description: "Your data is stored locally on your device. Take a backup anytime from the settings.",
            icon: Sparkles,
            color: "bg-emerald-600",
            image: "🚀"
        }
    ];

    const currentStep = steps[step];

    return (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center p-6 text-center">
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.1, y: -20 }}
                    className="max-w-md w-full"
                >
                    <div className={`w-24 h-24 ${currentStep.color} rounded-[32px] flex items-center justify-center text-white mx-auto mb-10 shadow-2xl`}>
                        <currentStep.icon size={48} />
                    </div>

                    <div className="text-8xl mb-8">{currentStep.image}</div>

                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">
                        {currentStep.title}
                    </h2>

                    <p className="text-slate-500 font-bold text-lg leading-relaxed mb-12 px-4">
                        {currentStep.description}
                    </p>
                </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-12 left-0 right-0 px-10 flex flex-col items-center gap-6">
                <div className="flex gap-2">
                    {steps.map((_, i) => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? 'w-10 bg-slate-900' : 'w-2 bg-slate-200'}`}></div>
                    ))}
                </div>

                <Button
                    size="xl"
                    className="w-full shadow-2xl"
                    onClick={() => step < steps.length - 1 ? setStep(step + 1) : onComplete()}
                >
                    {step === steps.length - 1 ? "Get Started" : "Next Discovery"}
                    <ArrowRight size={20} />
                </Button>
            </div>
        </div>
    );
}
