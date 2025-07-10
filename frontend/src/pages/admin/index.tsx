import { useEffect, useState } from "react";
import adminService, { AdminStats } from "../../services/admin.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDistance } from "date-fns";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await adminService.getAdminStats();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching admin stats:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <p className="text-3xl font-bold">{stats?.userMetrics.totalUsers || 0}</p>
                <p className="text-xs text-green-500 mt-1">
                  {stats?.userMetrics.activeUsers || 0} active users
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Mock Trials Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mock Trials
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <p className="text-3xl font-bold">{stats?.mockTrialMetrics.totalMockTrials || 0}</p>
                <p className="text-xs text-green-500 mt-1">
                  {stats?.mockTrialMetrics.recentMockTrials || 0} in last 30 days
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Subscriptions Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <p className="text-3xl font-bold">{stats?.subscriptionMetrics.activeSubscriptions || 0}</p>
                <p className="text-xs text-green-500 mt-1">
                  {stats?.subscriptionMetrics.totalSubscriptions 
                    ? Math.round((stats.subscriptionMetrics.activeSubscriptions / stats.subscriptionMetrics.totalSubscriptions) * 100) 
                    : 0}% of total
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Credits Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <p className="text-3xl font-bold">{stats?.usageMetrics.totalCredits || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all users
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent User Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="mb-3">
                  <Skeleton className="h-16 w-full" />
                </div>
              ))
            ) : (
              <div className="space-y-4">
                {stats?.userMetrics.recentUsers?.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge variant="outline">
                      {formatDistance(new Date(user.createdAt), new Date(), { addSuffix: true })}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Recent Mock Trials */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Mock Trials</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="mb-3">
                  <Skeleton className="h-16 w-full" />
                </div>
              ))
            ) : (
              <div className="space-y-4">
                {stats?.mockTrialMetrics.latestMockTrials?.slice(0, 5).map((trial) => (
                  <div key={trial.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Trial #{trial.id}</p>
                      <p className="text-sm text-muted-foreground">{trial.user.name}</p>
                    </div>
                    <Badge variant="outline">
                      {formatDistance(new Date(trial.createdAt), new Date(), { addSuffix: true })}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Top Users */}
      <Card>
        <CardHeader>
          <CardTitle>Top Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <div className="space-y-4">
              {stats?.usageMetrics.topUsers?.map((user) => (
                <div key={user.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge>{user.credits} credits</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Subscription Plan Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plan Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <div className="space-y-4">
              {stats?.subscriptionMetrics.subscriptionPlanDistribution?.map((plan) => (
                <div key={plan.planId} className="flex items-center justify-between">
                  <p className="font-medium">{plan.planName}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{plan.count} subscribers</span>
                    <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ 
                          width: `${Math.min(
                            100, 
                            Math.max(
                              5, 
                              (plan.count / 
                                (stats.subscriptionMetrics.activeSubscriptions || 1)) * 100
                            )
                          )}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 