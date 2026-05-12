import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

type User = {
  id: string;
  fullName?: string;
  email?: string;
  role?: string;
  verified?: boolean;
  username?: string;
  createdAt?: string;
};

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUserRole, setSelectedUserRole] = useState<string | null>(null);
  const { data: authData, isLoading: authLoading } = useQuery({
    queryKey: ["auth/me"],
    queryFn: () => apiRequest("GET", "/api/auth/me").then((res) => res.json()),
  });

  const user = authData as User | undefined;
  const isAdmin = user?.role === "admin";

  const { data: campaigns = [] } = useQuery({
    queryKey: ["admin/campaigns"],
    queryFn: () => apiRequest("GET", "/api/campaigns").then((res) => res.json()),
    enabled: isAdmin,
  });

  const { data: stories = [] } = useQuery({
    queryKey: ["admin/stories"],
    queryFn: () => apiRequest("GET", "/api/stories").then((res) => res.json()),
    enabled: isAdmin,
  });

  const { data: aidRequests = [] } = useQuery({
    queryKey: ["aid-requests"],
    queryFn: () => apiRequest("GET", "/api/aid-requests").then((res) => res.json()),
    enabled: isAdmin,
  });

  const { data: volunteers = [] } = useQuery({
    queryKey: ["admin/volunteers"],
    queryFn: () => apiRequest("GET", "/api/volunteers").then((res) => res.json()),
    enabled: isAdmin,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["admin/users"],
    queryFn: () => apiRequest("GET", "/api/users").then((res) => res.json()),
    enabled: isAdmin,
  });

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await apiRequest("PUT", `/api/users/${userId}`, { role: newRole });
      toast({
        title: t("Role Updated"),
        description: `User role changed to ${newRole}`,
      });
      // Invalidate query to refresh user list
      queryClient.invalidateQueries({ queryKey: ["admin/users"] });
    } catch (error: any) {
      toast({
        title: t("Update Failed"),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const userCounts = (users as User[]).reduce(
    (acc, current) => {
      const role = current.role || "donor";
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  if (authLoading) {
    return <div className="min-h-screen py-24 text-center">{t("Loading admin dashboard...")}</div>;
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Card className="p-10">
            <h1 className="text-3xl font-bold mb-4">{t("Admin Access Required")}</h1>
            <p className="text-muted-foreground mb-6">
              {t("This area is reserved for Charity Admins. Please sign in with an admin account to continue.")}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link href="/login">
                <Button asChild>
                  <a>{t("Go to Login")}</a>
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 font-['Poppins']">{user?.role === "system_admin" ? "System Administration" : "Charity Admin Control Center"}</h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              {user?.role === "system_admin"
                ? "Manage users, roles, campaigns, stories, volunteer support, beneficiary requests and system settings."
                : "Manage campaigns, stories, volunteer support, beneficiary requests and user accounts from a secure admin dashboard."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">{t("Active Campaigns")}</p>
            <p className="text-3xl font-bold">{(campaigns as any[]).length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">{t("Stories")}</p>
            <p className="text-3xl font-bold">{(stories as any[]).length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">{t("Beneficiary Requests")}</p>
            <p className="text-3xl font-bold">{(aidRequests as any[]).length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">{t("Volunteers")}</p>
            <p className="text-3xl font-bold">{(volunteers as any[]).length}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-3">{t("Campaigns")}</h2>
            <p className="text-sm text-muted-foreground mb-5">
              {t("Create, edit and approve campaign content for the charity website.")}
            </p>
            <div className="flex flex-col gap-2 mb-4">
              <Link href="/create-campaign">
                <Button asChild className="w-full">
                  <a>{t("Create New Campaign")}</a>
                </Button>
              </Link>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {(campaigns as any[]).length === 0 ? (
                <p className="text-muted-foreground text-sm">{t("No campaigns yet")}</p>
              ) : (
                (campaigns as any[]).map((campaign: any) => (
                  <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{campaign.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{campaign.status}</p>
                    </div>
                    <div className="flex gap-2 ml-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.location.href = `/edit-campaign/${campaign.id}`}
                      >
                        {t("Edit")}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${campaign.title}"?`)) {
                            apiRequest("DELETE", `/api/campaigns/${campaign.id}`).then(() => {
                              toast({ title: t("Deleted"), description: t("Campaign deleted successfully") });
                              queryClient.invalidateQueries({ queryKey: ["admin/campaigns"] });
                            }).catch((error) => {
                              toast({ title: t("Error"), description: error.message, variant: "destructive" });
                            });
                          }
                        }}
                      >
                        {t("Delete")}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-3">{t("Stories")}</h2>
            <p className="text-sm text-muted-foreground mb-5">
              {t("Create, edit and publish impact stories from donors, volunteers, and beneficiaries.")}
            </p>
            <div className="flex flex-col gap-3 mb-4">
              <Link href="/create-story">
                <Button asChild className="w-full">
                  <a>{t("Create New Story")}</a>
                </Button>
              </Link>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {(stories as any[]).length === 0 ? (
                <p className="text-muted-foreground text-sm">{t("No stories yet")}</p>
              ) : (
                (stories as any[]).map((story: any) => (
                  <div key={story.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{story.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {story.published ? t("Published") : t("Draft")}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.location.href = `/edit-story/${story.id}`}
                      >
                        {t("Edit")}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${story.title}"?`)) {
                            apiRequest("DELETE", `/api/stories/${story.id}`)
                              .then(() => {
                                toast({ title: t("Deleted"), description: t("Story deleted successfully") });
                                queryClient.invalidateQueries({ queryKey: ["admin/stories"] });
                              })
                              .catch((error) => {
                                toast({ title: t("Error"), description: error.message, variant: "destructive" });
                              });
                          }
                        }}
                      >
                        {t("Delete")}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-3">{t("Volunteer Events")}</h2>
            <p className="text-sm text-muted-foreground mb-5">
              {t("Review and approve volunteer applications.")}
            </p>
            <div className="flex flex-col gap-2">
              <div className="text-sm mb-3">
                <p className="font-medium">{(volunteers as any[]).filter((v: any) => v.status === "pending").length} {t("Pending Approvals")}</p>
              </div>
              <p className="text-xs text-muted-foreground">{t("Use the list below to manage volunteer applications")}</p>
            </div>
          </Card>
        </div>

        <div className="mt-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t("Pending Volunteer Approvals")}</h2>
            {(volunteers as any[]).filter((v: any) => v.status === "pending").length === 0 ? (
              <p className="text-muted-foreground">{t("No pending volunteer applications")}</p>
            ) : (
              <div className="space-y-3">
                {(volunteers as any[]).filter((v: any) => v.status === "pending").map((volunteer: any) => (
                  <div key={volunteer.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{volunteer.experience || "Volunteer Application"}</p>
                      <p className="text-xs text-muted-foreground">{volunteer.availability || "Availability not specified"}</p>
                      <p className="text-xs text-muted-foreground mt-1">ID: {volunteer.id}</p>
                    </div>
                    <div className="flex gap-2 ml-2 flex-shrink-0">
                      <Button
                        size="sm"
                        onClick={() => {
                          apiRequest("PUT", `/api/volunteers/${volunteer.id}/status`, { status: "approved" }).then(() => {
                            toast({
                              title: t("Approved"),
                              description: t("Volunteer has been approved"),
                            });
                            queryClient.invalidateQueries({ queryKey: ["admin/volunteers"] });
                          }).catch((error) => {
                            toast({
                              title: t("Error"),
                              description: error.message,
                              variant: "destructive",
                            });
                          });
                        }}
                      >
                        {t("Approve")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          apiRequest("PUT", `/api/volunteers/${volunteer.id}/status`, { status: "rejected" }).then(() => {
                            toast({
                              title: t("Rejected"),
                              description: t("Volunteer application has been rejected"),
                            });
                            queryClient.invalidateQueries({ queryKey: ["admin/volunteers"] });
                          }).catch((error) => {
                            toast({
                              title: t("Error"),
                              description: error.message,
                              variant: "destructive",
                            });
                          });
                        }}
                      >
                        {t("Reject")}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (confirm(t("Are you sure you want to delete this volunteer application?"))) {
                            apiRequest("DELETE", `/api/volunteers/${volunteer.id}`).then(() => {
                              toast({
                                title: t("Deleted"),
                                description: t("Volunteer application has been deleted"),
                              });
                              queryClient.invalidateQueries({ queryKey: ["admin/volunteers"] });
                            }).catch((error) => {
                              toast({
                                title: t("Error"),
                                description: error.message,
                                variant: "destructive",
                              });
                            });
                          }
                        }}
                      >
                        {t("Delete")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="mt-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t("Pending Aid Request Approvals")}</h2>
            {(aidRequests as any[]).filter((r: any) => r.status === "pending").length === 0 ? (
              <p className="text-muted-foreground">{t("No pending aid requests")}</p>
            ) : (
              <div className="space-y-3">
                {(aidRequests as any[]).filter((r: any) => r.status === "pending").map((request: any) => (
                  <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{request.title}</p>
                      <p className="text-xs text-muted-foreground">{request.category} - {request.urgency} urgency</p>
                      <p className="text-xs text-muted-foreground">{request.location}</p>
                    </div>
                    <div className="flex gap-2 ml-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          apiRequest("PUT", `/api/aid-requests/${request.id}/status`, { status: "approved" }).then(() => {
                            toast({
                              title: t("Approved"),
                              description: t("Aid request has been approved"),
                            });
                            queryClient.invalidateQueries({ queryKey: ["aid-requests"] });
                          });
                        }}
                      >
                        {t("Approve")}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          apiRequest("PUT", `/api/aid-requests/${request.id}/status`, { status: "rejected" }).then(() => {
                            toast({
                              title: t("Rejected"),
                              description: t("Aid request has been rejected"),
                            });
                            queryClient.invalidateQueries({ queryKey: ["aid-requests"] });
                          });
                        }}
                      >
                        {t("Reject")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-3">{t("Account Management")}</h2>
            <p className="text-sm text-muted-foreground mb-5">
              {t("Verify and manage user accounts, including donors, volunteers and beneficiaries.")}
            </p>
            <div className="space-y-3">
              {Object.entries(userCounts).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between gap-2">
                  <span className="capitalize">{role}</span>
                  <Badge>{count}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-3">{t("Beneficiary Requests")}</h2>
            <p className="text-sm text-muted-foreground mb-5">
              {t("Review pending aid requests and approve the cases that need urgent support.")}
            </p>
            <div className="flex flex-col gap-2">
              <div className="text-sm mb-3">
                <p className="font-medium">{(aidRequests as any[]).filter((r: any) => r.status === "pending").length} {t("Pending Requests")}</p>
              </div>
              <Button variant="outline" className="w-full" onClick={() => {
                const requestId = prompt("Enter request ID to manage:");
                if (requestId) {
                  const action = prompt("Enter 'approve', 'reject', or 'fulfill':");
                  if (action === "approve") {
                    apiRequest("PUT", `/api/aid-requests/${requestId}/status`, { status: "approved" }).then(() => {
                      toast({ title: t("Approved"), description: t("Aid request has been approved") });
                      queryClient.invalidateQueries({ queryKey: ["aid-requests"] });
                    });
                  } else if (action === "reject") {
                    apiRequest("PUT", `/api/aid-requests/${requestId}/status`, { status: "rejected" }).then(() => {
                      toast({ title: t("Rejected"), description: t("Aid request has been rejected") });
                      queryClient.invalidateQueries({ queryKey: ["aid-requests"] });
                    });
                  } else if (action === "fulfill") {
                    apiRequest("PUT", `/api/aid-requests/${requestId}/status`, { status: "fulfilled" }).then(() => {
                      toast({ title: t("Fulfilled"), description: t("Aid request has been fulfilled") });
                      queryClient.invalidateQueries({ queryKey: ["aid-requests"] });
                    });
                  }
                }
              }}>
                {t("Manage Requests")}
              </Button>
            </div>
          </Card>
        </div>

        {user?.role === "system_admin" && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 font-['Poppins']">{t("System Administration")}</h2>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">{t("User Management")}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2 px-2">{t("Email")}</th>
                      <th className="text-left py-2 px-2">{t("Full Name")}</th>
                      <th className="text-left py-2 px-2">{t("Role")}</th>
                      <th className="text-left py-2 px-2">{t("Verified")}</th>
                      <th className="text-left py-2 px-2">{t("Created")}</th>
                      <th className="text-left py-2 px-2">{t("Actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(users as User[]).map((u) => (
                      <tr key={u.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2 text-xs">{u.email}</td>
                        <td className="py-3 px-2">{u.fullName || u.username || "-"}</td>
                        <td className="py-3 px-2">
                          <Select defaultValue={u.role || "donor"} onValueChange={(value) => handleRoleChange(u.id, value)}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="donor">{t("Donor")}</SelectItem>
                              <SelectItem value="volunteer">{t("Volunteer")}</SelectItem>
                              <SelectItem value="beneficiary">{t("Beneficiary")}</SelectItem>
                              <SelectItem value="admin">{t("Admin")}</SelectItem>
                              <SelectItem value="system_admin">{t("System Admin")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant={u.verified ? "default" : "secondary"}>
                            {u.verified ? t("Yes") : t("No")}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-xs">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                        </td>
                        <td className="py-3 px-2">
                          <Button variant="ghost" size="sm" disabled>{t("Edit")}</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
