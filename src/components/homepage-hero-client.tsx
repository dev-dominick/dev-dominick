'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui';
import { ArrowRight, LogIn } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function HomepageHeroClient() {
    const { status } = useSession();
    const [isDevUser, setIsDevUser] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Check localStorage only after mount to avoid hydration mismatch
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
        setIsDevUser(Boolean(localStorage.getItem('x-user-id')));
    }, []);

    const isLoggedIn = status === 'authenticated';

    // Render loading state until mounted to prevent hydration mismatch
    if (!mounted) {
        return (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/contact">
                    <Button size="lg">
                        Get Started Free
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </Link>
                <Link href="/login">
                    <Button variant="secondary" size="lg">
                        Sign In
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isLoggedIn || isDevUser ? (
                <>
                    <Link href="/admin">
                        <Button size="lg" className="flex items-center gap-2">
                            Open Dashboard
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </Link>
                    <Link href="/admin">
                        <Button variant="secondary" size="lg" className="flex items-center gap-2">
                            <LogIn className="w-5 h-5" />
                            Account
                        </Button>
                    </Link>
                </>
            ) : (
                <>
                    <Link href="/contact">
                        <Button size="lg" className="flex items-center gap-2">
                            Get Started Free
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </Link>
                    <Link href="/login">
                        <Button variant="secondary" size="lg">
                            Sign In
                        </Button>
                    </Link>
                </>
            )}
        </div>
    );
}
