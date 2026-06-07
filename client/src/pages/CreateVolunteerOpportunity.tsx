import { useForm, useFieldArray } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Plus, X } from "lucide-react";

type Campaign = {
  id: string;
  title: string;
  status: string;
  archived: boolean;
};

type FormData = {
  campaignId: string;
  availability: string;
  experience: string;
  skills: { value: string }[];
  status: "pending" | "approved";
};

export default function CreateVolunteerOpportunity() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Fetch running campaigns to link with
  const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
    queryFn: () => apiRequest("GET", "/api/campaigns").then((res) => res.json()),
  });

  const activeCampaigns = campaigns.filter((c) => c.status === "active" && !c.archived);

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      campaignId: "",
      availability: "",
      experience: "",
      skills: [{ value: "Community Support" }],
      status: "approved",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "skills",
  });

  const mutation = useMutation({
    mutationFn: (newVolunteer: any) => {
      return apiRequest("POST", "/api/volunteers", newVolunteer).then((res) => res.json());
    },
    onSuccess: () => {
      toast({
        title: t("Opportunity Configured"),
        description: t("Volunteer template requirements registered successfully!"),
      });
      queryClient.invalidateQueries({ queryKey: ["admin/volunteers"] });
      queryClient.invalidateQueries({ queryKey: ["admin/volunteer-opportunities"] });
      setLocation("/admin");
    },
    onError: (error: any) => {
      toast({
        title: t("Submission Failed"),
        description: error.message || t("Something went wrong"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    // FIX: Completely omitted the 'userId' property. 
    // Omitting it lets Zod safely parse the payload as undefined/optional, satisfying the backend schema constraint.
    const formattedData = {
      campaignId: data.campaignId,
      availability: data.availability,
      experience: data.experience,
      skills: data.skills.map((s) => s.value).filter(Boolean),
      status: data.status,
    };

    mutation.mutate(formattedData);
  };

  return (
    <div className="min-h-screen py-12 max-w-3xl mx-auto px-4">
      <Button 
        variant="ghost" 
        className="mb-6 gap-2" 
        onClick={() => setLocation("/admin")}
      >
        <ArrowLeft className="h-4 w-4" />
        {t("Back to Dashboard")}
      </Button>

      <Card className="p-6 md:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold font-['Poppins']">{t("Initialize Volunteer Posting")}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t("Establish baseline specifications and talent criteria linked to an active target charity drive.")}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Campaign Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("Associated Campaign Drive")}</label>
            {loadingCampaigns ? (
              <Input disabled value={t("Loading active operations...")} />
            ) : (
              <Select 
                onValueChange={(val) => setValue("campaignId", val)}
                defaultValue={watch("campaignId")}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("Select a campaign allocation target")} />
                </SelectTrigger>
                <SelectContent>
                  {activeCampaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.campaignId && (
              <p className="text-xs text-destructive">{t("You must pair this allocation to a campaign framework")}</p>
            )}
            <input type="hidden" {...register("campaignId", { required: true })} />
          </div>

          {/* Availability */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("Expected Time Allocation & Schedule")}</label>
            <Input 
              {...register("availability", { required: true })}
              placeholder={t("e.g. Weekends, 4-8 hours weekly, Flexible mornings")}
            />
          </div>

          {/* Dynamic Core Skills Fields */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center justify-between">
              <span>{t("Prerequisite Target Skills & Tags")}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={() => append({ value: "" })}
              >
                <Plus className="h-3 w-3" />
                {t("Add Skill Tag")}
              </Button>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <Input
                    {...register(`skills.${index}.value` as const, { required: true })}
                    placeholder={t("e.g. Logistics, First Aid, Translation")}
                    className="h-9"
                  />
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground hover:text-destructive"
                      onClick={() => remove(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Role Tasks / Experience Spec Textarea */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("Role Details & Experience Directives")}</label>
            <Textarea
              {...register("experience", { required: true })}
              rows={4}
              placeholder={t("Outline the core tasks, responsibilities, and any required background experience here...")}
            />
          </div>

          {/* Submission Panel */}
          <div className="flex gap-3 pt-4 border-t justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setLocation("/admin")}
              disabled={mutation.isPending}
            >
              {t("Cancel")}
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? t("Publishing...") : t("Publish Opportunity Slot")}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}