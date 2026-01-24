import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { PageHeader } from "@/components/app-shell";

export const metadata = {
    title: 'Analytics | Code Cloud',
    description: 'Business insights and performance metrics',
};

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                kicker="Reports"
                title="Analytics"
                subtitle="Business insights, performance metrics, and detailed reports"
                breadcrumbs={[{ label: "Analytics", href: "/app/analytics" }]}
            />

            <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>Analytics dashboard will be available soon.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-400">This feature is currently under development.</p>
                </CardContent>
            </Card>
        </div>
    );
}
