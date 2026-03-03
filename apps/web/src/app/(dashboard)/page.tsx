'use client';

import React from 'react';
import { ActivitySelector } from '@/components/layout/ActivitySelector';
import { DirectorMessages } from '@/components/library/DirectorMessages';
import { motion } from 'framer-motion';

export default function DashboardPage() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
            >
                <ActivitySelector />
                <DirectorMessages />
            </motion.div>
        </div>
    );
}
