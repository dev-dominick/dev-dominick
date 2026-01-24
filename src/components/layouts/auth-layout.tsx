import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'

export interface AuthLayoutProps {
    eyebrow?: string
    eyebrowIcon?: React.ReactNode
    title: string
    subtitle?: string
    features: Array<{
        icon: React.ReactNode
        text: string
    }>
    formTitle: string
    formDescription: string
    children: React.ReactNode
}

export function AuthLayout({
    eyebrow,
    eyebrowIcon,
    title,
    subtitle,
    features,
    formTitle,
    formDescription,
    children,
}: AuthLayoutProps) {
    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Background decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
                <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left side - Marketing content */}
                    <div className="text-white space-y-6">
                        {eyebrow && (
                            <div className="flex items-center gap-2 mb-4">
                                {eyebrowIcon}
                                <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
                                    {eyebrow}
                                </span>
                            </div>
                        )}

                        <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                            {title}
                        </h1>

                        {subtitle && (
                            <p className="text-xl text-slate-400">
                                {subtitle}
                            </p>
                        )}

                        <div className="space-y-4 pt-6">
                            {features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    {feature.icon}
                                    <span className="text-slate-300">{feature.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right side - Auth form */}
                    <Card className="bg-slate-900/80 backdrop-blur border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-2xl text-white">
                                {formTitle}
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                {formDescription}
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            {children}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    )
}
