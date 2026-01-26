import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { PageHeader } from "@/components/app-shell";

export const metadata = {
    title: "Settings | Code Cloud",
    description: "Manage your account, billing, and preferences",
};

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                kicker="Workspace"
                title="Settings"
                subtitle="Account preferences and configuration options."
                breadcrumbs={[{ label: "Settings", href: "/app/settings" }]}
            />

            <Card className="bg-slate-900/80 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white">Settings</CardTitle>
                    <CardDescription className="text-slate-400">Additional settings sections coming soon.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-400">Profile, billing, and notification settings will be available here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
