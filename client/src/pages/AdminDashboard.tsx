import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest, fetchCurrentUser } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

type User = {
  id: string;
  fullName?: string;
  email?: string;
  role?: string;
  verified?: boolean;
  blocked?: boolean;
  username?: string;
  createdAt?: string;
};

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUserRole, setSelectedUserRole] = useState<string | null>(null);
  
  // Adds a state tab so approved or rejected logs stay reviewable instead of vanishing
  const [volunteerSectionFilter, setVolunteerSectionFilter] = useState<string>("pending");

  const { data: authData, isLoading: authLoading } = useQuery({
    queryKey: ["auth/me"],
    queryFn: fetchCurrentUser,
  });

  const user = authData as User | undefined;
  const isAdmin = user?.role === "admin" || user?.role === "system_admin";
  const canManageUsers = user?.role === "admin" || user?.role === "system_admin";
  const canChangeRole = user?.role === "system_admin";

  const { data: campaigns = [] } = useQuery({
    queryKey: ["admin/campaigns"],
    queryFn: () => apiRequest("GET", "/api/campaigns?includeArchived=true").then((res) => res.json()),
    enabled: isAdmin,
  });

  const { data: stories = [] } = useQuery({
    queryKey: ["admin/stories"],
    queryFn: () => apiRequest("GET", "/api/stories").then((res) => res.json()),
    enabled: isAdmin,
  });

  const { data: aidRequests = [] } = useQuery({
    queryKey: ["admin/aid-requests"],
    queryFn: () => apiRequest("GET", "/api/aid-requests").then((res) => res.json()),
    enabled: isAdmin,
  });

  const { data: volunteers = [] } = useQuery({
    queryKey: ["admin/volunteers"],
    queryFn: () => apiRequest("GET", "/api/volunteers").then((res) => res.json()),
    enabled: isAdmin,
  });

  const { data: volunteerOpportunities = [] } = useQuery({
    queryKey: ["admin/volunteer-opportunities"],
    queryFn: () => apiRequest("GET", "/api/volunteer-opportunities").then((res) => res.json()),
    enabled: isAdmin,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["admin/users"],
    queryFn: () => apiRequest("GET", "/api/users").then((res) => res.json()),
    enabled: canManageUsers,
  });

  // Map userId -> volunteer status (approved | pending | rejected)
  const volunteerStatusMap = (volunteers as any[]).reduce((m: Map<string, string>, v: any) => {
    if (!v.userId) return m;
    const existing = m.get(v.userId);
    if (existing === "approved") return m;
    m.set(v.userId, v.status || "pending");
    return m;
  }, new Map<string, string>());

  const { data: volunteerPostings = [], isLoading: loadingPostings } = useQuery({
    queryKey: ["/api/admin-opportunities"],
    queryFn: () => apiRequest("GET", "/api/volunteers?limit=100").then((res) => res.json()),
    enabled: !!isAdmin,
  });




  const usersMap = new Map<string, User>((users as User[]).map((u) => [u.id, u]));
  
  const opportunitiesMap = new Map<string, any>();
  (volunteerPostings as any[]).forEach((op) => {
    if (op.id) opportunitiesMap.set(op.id, op);
    if (op.campaignId) opportunitiesMap.set(op.campaignId, op);
  });

  const openOpportunities = volunteerPostings.filter((v: any) => {
    const creator = usersMap.get(v.userId);
    return v.status === "approved" && (creator?.role === "admin" || creator?.role === "system_admin");
  });
 


  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await apiRequest("PUT", `/api/users/${userId}`, { role: newRole });
      toast({
        title: t("Role Updated"),
        description: `User role changed to ${newRole}`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin/users"] });
    } catch (error: any) {
      toast({
        title: t("Update Failed"),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUserUpdate = async (userId: string, updates: Record<string, any>, successMessage: string) => {
    try {
      await apiRequest("PUT", `/api/users/${userId}`, updates);
      toast({
        title: t("User Updated"),
        description: successMessage,
      });
      queryClient.invalidateQueries({ queryKey: ["admin/users"] });
    } catch (error: any) {
      toast({
        title: t("Update Failed"),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAidRequestStatusChange = async (requestId: string | undefined, value: string) => {
    if (!requestId) {
      toast({
        title: t("Missing Request ID"),
        description: t("Unable to update aid request status without a valid request ID."),
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("PUT", `/api/aid-requests/${requestId}/status`, { status: value });
      toast({
        title: t("Status Updated"),
        description: `Request status changed to ${value}`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin/aid-requests"] });
    } catch (error: any) {
      toast({
        title: t("Update Failed"),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteAidRequest = async (requestId: string | undefined, title: string) => {
    if (!requestId) {
      toast({
        title: t("Missing Request ID"),
        description: t("Unable to delete aid request without a valid request ID."),
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("DELETE", `/api/aid-requests/${requestId}`);
      toast({ title: t("Deleted"), description: t("Aid request deleted successfully") });
      queryClient.invalidateQueries({ queryKey: ["admin/aid-requests"] });
    } catch (error: any) {
      toast({ title: t("Error"), description: error.message, variant: "destructive" });
    }
  };

  const handleArchiveCampaign = async (campaignId: string, currentArchiveStatus: boolean) => {
    try {
      const endpoint = currentArchiveStatus ? `/api/campaigns/${campaignId}/unarchive` : `/api/campaigns/${campaignId}/archive`;
      await apiRequest("POST", endpoint, {});
      toast({
        title: t(currentArchiveStatus ? "Campaign Unarchived" : "Campaign Archived"),
        description: t(currentArchiveStatus ? "Campaign is now visible again" : "Campaign has been removed from listings"),
      });
      queryClient.invalidateQueries({ queryKey: ["admin/campaigns"] });
    } catch (error: any) {
      toast({
        title: t("Error"),
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


  const processedVolunteerApplications = (volunteers as any[]).filter((v: any) => {
    const applicant = usersMap.get(v.userId);
    const isApplicantAdmin = applicant?.role === "admin" || applicant?.role === "system_admin";

    return v.userId && !isApplicantAdmin;
  });
 
  const displayedApplications = processedVolunteerApplications.filter((v: any) => {
    const status = v.status || "pending";
    return status.toLowerCase() === volunteerSectionFilter.toLowerCase();
  });

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
          <h1 className="text-4xl md:text-5xl font-bold mb-3 font-['Poppins']">
            {user?.role === "system_admin" ? "System Administration" : "Charity Admin Control Center"}
          </h1>
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
            <p className="text-sm text-muted-foreground">{t("Active Positions")}</p>
             <p className="text-3xl font-bold">{openOpportunities.length}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Campaigns Card */}
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
                  <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg" style={{ opacity: campaign.archived ? 0.6 : 1 }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{campaign.title}</p>
                        {campaign.archived && <Badge variant="secondary" className="text-xs">{t("Archived")}</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground capitalize">{campaign.status}</p>
                    </div>
                    <div className="flex gap-2 ml-2">
                      <Link href={`/edit-campaign/${campaign.id}`}>
                        <Button size="sm" variant="outline">{t("Edit")}</Button>
                      </Link>
                      <Button
                        size="sm"
                        variant={campaign.archived ? "secondary" : "ghost"}
                        onClick={() => {
                          if (campaign.archived) {
                            if (confirm(`Unarchive "${campaign.title}"?`)) {
                              handleArchiveCampaign(campaign.id, true);
                            }
                          } else {
                            if (confirm(`Remove "${campaign.title}" from public listings? (Archive)`)) {
                              handleArchiveCampaign(campaign.id, false);
                            }
                          }
                        }}
                      >
                        {campaign.archived ? t("Unarchive") : t("Archive")}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${campaign.title}"? This permanently removes it.`)) {
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

          {/* Stories Card */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold font-['Poppins']">{t("Stories")}</h2>
                <p className="text-sm text-muted-foreground">
                  {t("Create, edit and publish impact stories from donors, volunteers, and beneficiaries.")}
                </p>
              </div>
              <Link href="/create-story">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  {t("Create Story")}
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

          {/* Volunteer Opportunities / Placement Management Card */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold font-['Poppins']">{t("Active Volunteer Postings")}</h2>
                <p className="text-sm text-muted-foreground">
                  {t("Track timeline configurations, required baseline skills, and statement outlines.")}
                </p>
              </div>
              <Link href="/create-volunteer-opportunity">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  {t("Create Opportunity")}
                </Button>
              </Link>
            </div>
            {loadingPostings ? (
              <div className="text-center py-8 text-muted-foreground animate-pulse">
                {t("Fetching active positions records...")}
              </div>
            ) : openOpportunities.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {openOpportunities.map((op: any) => (
                  <div 
                    key={op.id} 
                    className="p-4 border rounded-xl bg-card hover:shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-2">{op.experience}</p>
                      <p className="text-xs text-muted-foreground font-semibold">⏰ {op.availability || t("Flexible Commitments")}</p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {Array.isArray(op.skills) && op.skills.map((skill: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs bg-secondary/10 border-secondary/20 text-secondary font-normal">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 justify-end shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 h-9 px-3"
                        onClick={async () => {
                          if (confirm(t("Are you sure you want to delete this listing?"))) {
                            try {
                              await apiRequest("DELETE", `/api/volunteers/${op.id}`);
                              queryClient.invalidateQueries({ queryKey: ["/api/admin-opportunities"] });
                              toast({ title: t("Opportunity Slot Deleted") });
                            } catch (err) {
                              toast({ title: t("Failed to clear element"), variant: "destructive" });
                            }
                          }
                        }}
                      >
                        {t("Delete")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed rounded-2xl text-muted-foreground bg-muted/5">
                {t("No customized opportunity configurations found. Launch one using the button above.")}
              </div>
            )}
          </Card>
        </div>

        {/* Re-engineered Applications Section with Profile Lookup and Status Tabs */}
        <div className="mt-8">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold">{t("Volunteer Application Records")}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("Review volunteer intent profiles, availability schedules, and direct contact details.")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">{t("Status Group:")}</span>
                <Select value={volunteerSectionFilter} onValueChange={setVolunteerSectionFilter}>
                  <SelectTrigger className="w-36 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t("Pending Only")}</SelectItem>
                    <SelectItem value="approved">{t("Approved Longlist")}</SelectItem>
                    <SelectItem value="rejected">{t("Archived Rejections")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {displayedApplications.length === 0 ? (
              <div className="text-center py-10 border border-dashed rounded-xl text-muted-foreground text-sm bg-muted/5">
                {t("No applications found marked as ")} <span className="font-semibold underline capitalize">{volunteerSectionFilter}</span>.
              </div>
            ) : (
              <div className="space-y-4">
                {displayedApplications.map((volunteer: any) => {
                  const profileInfo = usersMap.get(volunteer.userId);
                  
                  const targetId = volunteer.campaignId || volunteer.opportunityId || volunteer.id;
                  const opportunityInfo = opportunitiesMap.get(targetId);
                  
                  return (
                    <div key={volunteer.id} className="p-4 border rounded-xl hover:shadow-sm bg-card transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-3">
            
            {/* Profile Info Lookup Container */}
            <div className="bg-muted/60 p-3 rounded-lg border border-border/80 max-w-xl">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{t("Applicant Account Profiles")}</p>
              <p className="text-sm font-semibold text-foreground">
                👤 {profileInfo?.fullName || profileInfo?.username || t("Anonymous Volunteer")}
              </p>
              <p className="text-xs text-muted-foreground font-medium pl-4 mt-0.5">
                {profileInfo?.email || t("No contact email assigned")}
              </p>
            </div>

            {/* Position Info Lookup Container */}
            <div className="bg-primary/5 p-3 rounded-lg border border-primary/10 max-w-xl">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">{t("Applied For Position")}</p>
              <p className="text-sm font-semibold text-foreground">
                 {opportunityInfo?.title || opportunityInfo?.experience || t("General / Unspecified Assignment")}
              </p>
              <p className="text-[11px] text-muted-foreground pl-4 mt-0.5">
                ID Link: {volunteer.campaignId || t("N/A")}
              </p>
            </div>

            {/* Experience and Availability statements */}
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("Intent Statement / Experience")}</p>
              <p className="font-normal text-sm text-foreground bg-background/50 p-2.5 rounded border border-dashed italic">
                "{volunteer.experience || t("No intent summary provided.")}"
              </p>
              <p className="text-xs text-muted-foreground font-semibold pt-1">
                {t("Stated Availability Details:")} <span className="font-normal text-foreground">{volunteer.availability || t("Flexible Commitments")}</span>
              </p>
            </div>
                        <div className="flex flex-wrap gap-1.5 items-center pt-1">
                          <Badge variant="outline" className="text-[10px] px-2 py-0 font-normal">
                            ID: {volunteer.id}
                          </Badge>
                          <Badge 
                            variant={volunteer.status === "approved" ? "default" : volunteer.status === "rejected" ? "destructive" : "secondary"}
                            className="text-[10px] px-2 py-0 capitalize font-medium"
                          >
                            {volunteer.status || "pending"}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex gap-2 md:self-center justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border/40">
                        {volunteer.status !== "approved" && (
                          <Button
                            size="sm"
                            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => {
                              apiRequest("PUT", `/api/volunteers/${volunteer.id}/status`, { status: "approved" }).then(() => {
                                toast({
                                  title: t("Approved Successfully"),
                                  description: t("Volunteer role status updated to approved."),
                                });
                                queryClient.invalidateQueries({ queryKey: ["admin/volunteers"] });
                              }).catch((error) => {
                                toast({ title: t("Error"), description: error.message, variant: "destructive" });
                              });
                            }}
                          >
                            {t("Approve")}
                          </Button>
                        )}
                        
                        {volunteer.status !== "rejected" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs text-amber-600 border-amber-200 hover:bg-amber-50"
                            onClick={() => {
                              apiRequest("PUT", `/api/volunteers/${volunteer.id}/status`, { status: "rejected" }).then(() => {
                                toast({
                                  title: t("Application Rejected"),
                                  description: t("Application shifted to rejection archives tab."),
                                });
                                queryClient.invalidateQueries({ queryKey: ["admin/volunteers"] });
                              }).catch((error) => {
                                toast({ title: t("Error"), description: error.message, variant: "destructive" });
                              });
                            }}
                          >
                            {t("Reject")}
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 text-xs"
                          onClick={() => {
                            if (confirm(t("Are you sure you want to delete this volunteer application permanently?"))) {
                              apiRequest("DELETE", `/api/volunteers/${volunteer.id}`).then(() => {
                                toast({
                                  title: t("Deleted"),
                                  description: t("Volunteer application log has been removed from database."),
                                });
                                queryClient.invalidateQueries({ queryKey: ["admin/volunteers"] });
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
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        <div className="mt-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t("Aid Request Management")}</h2>
            {(aidRequests as any[]).length === 0 ? (
              <p className="text-muted-foreground">{t("No aid requests")}</p>
            ) : (
              <div className="space-y-3">
                {(aidRequests as any[]).map((request: any) => (
                  <div key={request.id || request.userId || `${request.title}-${request.category}`}
                    className="flex flex-col gap-3 p-3 border rounded-lg sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-sm truncate">{request.title}</p>
                        {request.id ? (
                          <Badge variant="secondary" className="text-xs">
                            {t("ID")}: {request.id}
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            {t("Missing ID")}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {request.category} • {request.urgency} • {request.location || t("Unknown location")}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center ml-0 sm:ml-2">
                      <Select
                        value={request.status || "pending"}
                        onValueChange={(value) => handleAidRequestStatusChange(request.id, value)}
                      >
                        <SelectTrigger className="w-32 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">{t("Pending")}</SelectItem>
                          <SelectItem value="under_review">{t("Under Review")}</SelectItem>
                          <SelectItem value="approved">{t("Approved")}</SelectItem>
                          <SelectItem value="rejected">{t("Rejected")}</SelectItem>
                          <SelectItem value="fulfilled">{t("Fulfilled")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (!request.id) {
                            toast({
                              title: t("Missing Request ID"),
                              description: t("Unable to delete aid request without a valid request ID."),
                              variant: "destructive",
                            });
                            return;
                          }

                          if (confirm(`Are you sure you want to delete "${request.title}"?`)) {
                            handleDeleteAidRequest(request.id, request.title);
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

        <div className="grid grid-cols-1 gap-6">
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
        </div>

        {canManageUsers && (
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
                      <th className="text-left py-2 px-2">{t("Volunteer")}</th>
                      <th className="text-left py-2 px-2">{t("Role")}</th>
                      <th className="text-left py-2 px-2">{t("Verified")}</th>
                      <th className="text-left py-2 px-2">{t("Blocked")}</th>
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
                          {volunteerStatusMap.get(u.id) ? (
                            <Badge variant={volunteerStatusMap.get(u.id) === "approved" ? "default" : "secondary"}>
                              {volunteerStatusMap.get(u.id)}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          {canChangeRole ? (
                            <Select defaultValue={u.role || "donor"} onValueChange={(value) => handleRoleChange(u.id, value)}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="donor">{t("Donor")}</SelectItem>
                                <SelectItem value="beneficiary">{t("Beneficiary")}</SelectItem>
                                <SelectItem value="admin">{t("Admin")}</SelectItem>
                                <SelectItem value="system_admin">{t("System Admin")}</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="capitalize">{u.role || t("donor")}</span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant={u.verified ? "default" : "secondary"}>
                            {u.verified ? t("Yes") : t("No")}
                          </Badge>
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant={u.blocked ? "destructive" : "default"}>
                            {u.blocked ? t("Yes") : t("No")}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-xs">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant={u.verified ? "outline" : "secondary"}
                              size="sm"
                              disabled={u.verified}
                              onClick={() => handleUserUpdate(u.id, { verified: true }, `${u.email} is now verified`)}
                            >
                              {u.verified ? t("Verified") : t("Verify")}
                            </Button>
                            <Button
                              variant={u.blocked ? "secondary" : "destructive"}
                              size="sm"
                              onClick={() => handleUserUpdate(u.id, { blocked: !u.blocked }, u.blocked ? `${u.email} is unblocked` : `${u.email} is blocked`)}
                            >
                              {u.blocked ? t("Unblock") : t("Block")}
                            </Button>
                          </div>
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