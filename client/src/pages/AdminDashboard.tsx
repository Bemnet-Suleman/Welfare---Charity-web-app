import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";

type User = {
  id: string;
  fullName?: string;
  email?: string;
  role?: string;
  verified?: boolean;
};

export default function AdminDashboard() {
  const { t } = useTranslation();

  const { data: authData, isLoading: authLoading } = useQuery({
    queryKey: ["auth/me"],
    queryFn: () => apiRequest("GET", "/api/auth/me").then((res) => res.json().then(({ user }: any) => user)),
    retry: 1,
    staleTime: 1000 * 60 * 5,
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
    queryKey: ["admin/aid-requests"],
    queryFn: () => apiRequest("GET", "/api/aid-requests").then((res) => res.json()),
    enabled: isAdmin,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["admin/users"],
    queryFn: () => apiRequest("GET", "/api/users").then((res) => res.json()),
    enabled: isAdmin,
  });

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
            <p className="text-sm text-muted-foreground">{t("User Accounts")}</p>
            <p className="text-3xl font-bold">{(users as User[]).length}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-3">{t("Campaigns")}</h2>
            <p className="text-sm text-muted-foreground mb-5">
              {t("Create, edit and approve campaign content for the charity website.")}
            </p>
            <div className="flex flex-col gap-2">
              <Link href="/create-campaign">
                <Button asChild className="w-full">
                  <a>{t("Create New Campaign")}</a>
                </Button>
              </Link>
              <Link href="/campaigns">
                <Button asChild variant="outline" className="w-full">
                  <a>{t("Browse Campaigns")}</a>
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-3">{t("Stories")}</h2>
            <p className="text-sm text-muted-foreground mb-5">
              {t("Review and publish stories about donors, volunteers, and beneficiaries.")}
            </p>
            <div className="flex flex-col gap-2">
              <Button className="w-full" disabled>{t("Manage Stories")}</Button>
              <Link href="/stories">
                <Button asChild variant="outline" className="w-full">
                  <a>{t("View Stories")}</a>
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-3">{t("Volunteer Events")}</h2>
            <p className="text-sm text-muted-foreground mb-5">
              {t("Assign volunteer support and oversee active campaign opportunities.")}
            </p>
            <div className="flex flex-col gap-2">
              <Link href="/volunteer">
                <Button asChild className="w-full">
                  <a>{t("Review Volunteer Opportunities")}</a>
                </Button>
              </Link>
              <Button variant="outline" className="w-full" disabled>{t("Assign Volunteers")}</Button>
            </div>
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
              <Link href="/request-aid">
                <Button asChild className="w-full">
                  <a>{t("View Aid Requests")}</a>
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
