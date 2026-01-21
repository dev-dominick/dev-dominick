import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/ui';
import { PageHeader } from "@/components/app-shell";
import Link from "next/link";

export const metadata = {
    title: "Settings | Code Cloud",
    description: "Manage your account, billing, and preferences",
};

export default function SettingsPage() {
    const links = [
        { href: "/app/profile", title: "Profile", description: "Name, email, and password" },
        { href: "/app/billing", title: "Billing", description: "Payment methods and invoices" },
        { href: "/app/notifications", title: "Notifications", description: "Email and in-app alerts" },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                kicker="Workspace"
                title="Settings"
                subtitle="Adjust account details while we wire the full settings experience."
                breadcrumbs={[{ label: "Settings", href: "/app/settings" }]}
            />

            <Card className="bg-slate-900/80 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white">Available sections</CardTitle>
                    <CardDescription className="text-slate-400">Stub links until backend preferences are ready.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {links.map((link) => (
                            <Link key={link.href} href={link.href} className="block">
                                <div className="rounded-lg border border-slate-800 bg-slate-800/40 p-4 transition hover:border-slate-600">
                                    <div className="text-white font-semibold">{link.title}</div>
                                    <div className="text-slate-400 text-sm">{link.description}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
