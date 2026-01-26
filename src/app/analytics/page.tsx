import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { PageHeader } from "@/components/app-shell";
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Analytics | Code Cloud',
    description: 'Site traffic and performance metrics',
};

export const dynamic = 'force-dynamic';

async function getAnalytics() {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Total page views
    const totalViews = await prisma.pageView.count();
    const last30DaysViews = await prisma.pageView.count({
        where: { createdAt: { gte: last30Days } }
    });

    // Unique visitors (unique session IDs)
    const uniqueVisitors = await prisma.pageView.groupBy({
        by: ['sessionId'],
        _count: true,
    });

    const uniqueVisitorsLast30Days = await prisma.pageView.groupBy({
        by: ['sessionId'],
        where: { createdAt: { gte: last30Days } },
        _count: true,
    });

    // Popular pages
    const popularPages = await prisma.pageView.groupBy({
        by: ['path'],
        _count: true,
        orderBy: { _count: { path: 'desc' } },
        take: 10,
        where: { createdAt: { gte: last30Days } }
    });

    // Top referrers
    const topReferrers = await prisma.pageView.groupBy({
        by: ['referrer'],
        _count: true,
        orderBy: { _count: { referrer: 'desc' } },
        take: 10,
        where: {
            referrer: { not: null },
            createdAt: { gte: last30Days }
        }
    });

    // Device breakdown
    const deviceStats = await prisma.pageView.groupBy({
        by: ['device'],
        _count: true,
        where: { createdAt: { gte: last30Days } }
    });

    // Browser breakdown
    const browserStats = await prisma.pageView.groupBy({
        by: ['browser'],
        _count: true,
        where: { createdAt: { gte: last30Days } }
    });

    // Recent views
    const recentViews = await prisma.pageView.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        select: {
            path: true,
            createdAt: true,
            device: true,
            browser: true,
            country: true,
        }
    });

    return {
        totalViews,
        last30DaysViews,
        uniqueVisitors: uniqueVisitors.length,
        uniqueVisitorsLast30Days: uniqueVisitorsLast30Days.length,
        popularPages,
        topReferrers,
        deviceStats,
        browserStats,
        recentViews,
    };
}

export default async function AnalyticsPage() {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role?.includes('admin')) {
        redirect('/login');
    }

    const stats = await getAnalytics();

    return (
        <div className="space-y-6">
            <PageHeader
                kicker="Reports"
                title="Analytics"
                subtitle="Site traffic and performance metrics"
                breadcrumbs={[{ label: "Analytics", href: "/analytics" }]}
            />

            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Page Views</CardDescription>
                        <CardTitle className="text-3xl">{stats.totalViews.toLocaleString()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            {stats.last30DaysViews.toLocaleString()} in last 30 days
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Unique Visitors</CardDescription>
                        <CardTitle className="text-3xl">{stats.uniqueVisitors.toLocaleString()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            {stats.uniqueVisitorsLast30Days.toLocaleString()} in last 30 days
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Avg. Pages per Visitor</CardDescription>
                        <CardTitle className="text-3xl">
                            {stats.uniqueVisitorsLast30Days > 0 
                                ? (stats.last30DaysViews / stats.uniqueVisitorsLast30Days).toFixed(1)
                                : '0'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Last 30 days</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Top Device</CardDescription>
                        <CardTitle className="text-3xl capitalize">
                            {stats.deviceStats.length > 0
                                ? stats.deviceStats.sort((a: any, b: any) => b._count - a._count)[0].device
                                : 'N/A'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Most common device type</p>
                    </CardContent>
                </Card>
            </div>

            {/* Popular Pages & Top Referrers */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Popular Pages</CardTitle>
                        <CardDescription>Top 10 pages by views (last 30 days)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {stats.popularPages.length > 0 ? (
                                stats.popularPages.map((page: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                                        <span className="text-sm font-mono truncate flex-1 mr-4">{page.path}</span>
                                        <span className="text-sm font-semibold">{page._count.toLocaleString()}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No data yet</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top Referrers</CardTitle>
                        <CardDescription>Where your traffic comes from (last 30 days)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {stats.topReferrers.length > 0 ? (
                                stats.topReferrers.map((ref: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                                        <span className="text-sm truncate flex-1 mr-4">
                                            {ref.referrer || 'Direct'}
                                        </span>
                                        <span className="text-sm font-semibold">{ref._count.toLocaleString()}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No referrer data yet</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Device & Browser Stats */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Device Breakdown</CardTitle>
                        <CardDescription>Last 30 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {stats.deviceStats.length > 0 ? (
                                stats.deviceStats.map((device: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center py-2">
                                        <span className="text-sm capitalize">{device.device}</span>
                                        <span className="text-sm font-semibold">{device._count.toLocaleString()}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No data yet</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Browser Breakdown</CardTitle>
                        <CardDescription>Last 30 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {stats.browserStats.length > 0 ? (
                                stats.browserStats.map((browser: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center py-2">
                                        <span className="text-sm capitalize">{browser.browser}</span>
                                        <span className="text-sm font-semibold">{browser._count.toLocaleString()}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No data yet</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest 20 page views</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {stats.recentViews.length > 0 ? (
                            stats.recentViews.map((view: any, i: number) => (
                                <div key={i} className="flex flex-wrap gap-2 justify-between items-center py-2 border-b border-border last:border-0 text-sm">
                                    <span className="font-mono">{view.path}</span>
                                    <div className="flex gap-3 text-muted-foreground">
                                        <span className="capitalize">{view.device}</span>
                                        <span className="capitalize">{view.browser}</span>
                                        {view.country && <span>{view.country}</span>}
                                        <span>{new Date(view.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">No activity yet</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
