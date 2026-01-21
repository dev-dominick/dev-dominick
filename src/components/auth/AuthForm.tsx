'use client'

import * as React from 'react'
import { Button, InputWithIcon } from '@/lib/ui'
import { Mail, Lock, User, ArrowRight } from 'lucide-react'

export interface AuthFormProps {
    isLogin: boolean
    loading: boolean
    formData: {
        name?: string
        email: string
        password: string
    }
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onSubmit: (e: React.FormEvent) => void
    onToggleMode: () => void
}

export function AuthForm({
    isLogin,
    loading,
    formData,
    onChange,
    onSubmit,
    onToggleMode,
}: AuthFormProps) {
    return (
        <>
            <form onSubmit={onSubmit} className="space-y-4">
                {!isLogin && (
                    <InputWithIcon
                        id="name"
                        name="name"
                        type="text"
                        required={!isLogin}
                        value={formData.name || ''}
                        onChange={onChange}
                        placeholder="John Doe"
                        label="Full Name"
                        startIcon={<User className="w-5 h-5" />}
                        className="bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus-visible:ring-blue-500"
                    />
                )}

                <InputWithIcon
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={onChange}
                    placeholder="you@example.com"
                    label="Email Address"
                    startIcon={<Mail className="w-5 h-5" />}
                    className="bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus-visible:ring-blue-500"
                />

                <div>
                    <InputWithIcon
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={onChange}
                        placeholder={isLogin ? '••••••••' : 'Min. 8 characters'}
                        label="Password"
                        startIcon={<Lock className="w-5 h-5" />}
                        className="bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus-visible:ring-blue-500"
                    />
                    {!isLogin && (
                        <p className="mt-1 text-xs text-slate-400">
                            Must contain uppercase, lowercase, and number
                        </p>
                    )}
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md transition-colors flex items-center justify-center gap-2"
                >
                    {loading ? (
                        'Please wait...'
                    ) : (
                        <>
                            {isLogin ? 'Sign In' : 'Create Account'}
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </Button>
            </form>

            <div className="mt-6 text-center">
                <button
                    type="button"
                    onClick={onToggleMode}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                    {isLogin ? (
                        <>
                            Don&apos;t have an account?{' '}
                            <span className="text-blue-400 font-medium">Sign up</span>
                        </>
                    ) : (
                        <>
                            Already have an account?{' '}
                            <span className="text-blue-400 font-medium">Sign in</span>
                        </>
                    )}
                </button>
            </div>
        </>
    )
}
