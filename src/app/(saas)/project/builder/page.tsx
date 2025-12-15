'use client';

import { WizardLayout } from '@/features/builder/components/WizardLayout';
import { useBuilderStore } from '@/features/builder/store/useBuilderStore';
import { TopicSelection } from '@/features/builder/components/steps/TopicSelection';
import { AbstractGeneration } from '@/features/builder/components/steps/AbstractGeneration';
import { ChapterOutline } from '@/features/builder/components/steps/ChapterOutline';
import { AnimatePresence, motion } from 'framer-motion';

export default function BuilderPage() {
    const { currentStep } = useBuilderStore();

    return (
        <WizardLayout>
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    {currentStep === 1 && <TopicSelection />}
                    {currentStep === 2 && <AbstractGeneration />}
                    {currentStep === 3 && <ChapterOutline />}
                </motion.div>
            </AnimatePresence>
        </WizardLayout>
    );
}
