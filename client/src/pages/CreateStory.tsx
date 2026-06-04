import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { apiRequest, fetchCurrentUser } from "@/lib/queryClient";

export default function CreateStory() {
  const { t } = useTranslation();
  const params = useParams();
  const isEditing = !!params.id;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [authorRole, setAuthorRole] = useState("Beneficiary");
  const [category, setCategory] = useState("Impact Story");
  const [image, setImage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [published, setPublished] = useState(false);
  const [campaignId, setCampaignId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["auth/me"],
    queryFn: fetchCurrentUser,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  const { data: storyData, isLoading: storyLoading } = useQuery({
    queryKey: ["story", params.id],
    queryFn: () => apiRequest("GET", `/api/stories/${params.id}`).then((res) => res.json()),
    enabled: isEditing,
  });

  const user = userData as { role?: string } | undefined;
  const isAdmin = user?.role === "admin" || user?.role === "system_admin";

  useEffect(() => {
    if (typeof window !== "undefined" && !isEditing) {
      const query = new URLSearchParams(window.location.search);
      const providedCampaignId = query.get("campaignId");
      if (providedCampaignId) {
        setCampaignId(providedCampaignId);
      }
    }

    if (storyData) {
      setTitle(storyData.title || "");
      setContent(storyData.content || "");
      setAuthorName(storyData.author?.name || "");
      setAuthorId(storyData.author?.id || storyData.authorId || "");
      setAuthorRole(storyData.author?.role || "Beneficiary");
      setCategory(storyData.category || "Impact Story");
      setImage(storyData.image || "");
      setPublished(Boolean(storyData.published));
      setCampaignId(storyData.campaignId || "");
    }
  }, [storyData, isEditing]);

  const handleSubmit = async () => {
    if (!isAdmin) {
      alert(t("Only Charity Admin can manage stories."));
      return;
    }

    if (!title || !content || !authorName || !authorRole) {
      alert(t("Please fill in all required story fields."));
      return;
    }

    setIsSubmitting(true);

    try {
          const payload: any = {
        title,
        content,
        author: {
          name: authorName,
          role: authorRole,
          avatar: image || undefined,
        },
            authorId: authorId || undefined,
        category: category || "Impact Story",
        campaignId: campaignId || undefined,
        published,
      };

      if (!isEditing || image) {
        payload.image = image || undefined;
      }

      const endpoint = isEditing ? `/api/stories/${params.id}` : "/api/stories";
      const method = isEditing ? "PUT" : "POST";

      if (selectedFile) {
        const formData = new FormData();
        formData.append("image", selectedFile);
        formData.append("title", title);
        formData.append("content", content);
        formData.append("author", JSON.stringify(payload.author));
        if (authorId) formData.append("authorId", authorId);
        formData.append("category", payload.category);
        if (payload.campaignId) formData.append("campaignId", payload.campaignId);
        formData.append("published", String(payload.published));

        await apiRequest(method, endpoint, formData);
      } else {
        await apiRequest(method, endpoint, payload);
      }

      alert(t(isEditing ? "Story updated successfully." : "Story created successfully."));

      if (!isEditing) {
        setTitle("");
        setContent("");
        setAuthorName("");
        setAuthorId("");
        setAuthorRole("Beneficiary");
        setCategory("Impact Story");
        setImage("");
        setSelectedFile(null);
        setPublished(false);
      }

      window.location.href = "/admin";
    } catch (error: any) {
      console.error(error);
      alert(t(isEditing ? "Failed to update story." : "Failed to create story."));
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    setPreviewUrl(image || "");
  }, [selectedFile, image]);

  if (userLoading || (isEditing && storyLoading)) {
    return <div className="min-h-screen py-24 text-center">{t("Loading...")}</div>;
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <BookOpen className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-['Poppins']">
            {isEditing ? t("Edit Story") : t("Create a Story")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isEditing
              ? t("Update the story content, author details, and publication status.")
              : t("Add a new impact story from a donor, volunteer, or beneficiary.")}
          </p>
          {!isEditing && campaignId && (
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto mt-2">
              {t("This update will be attached to campaign ID")} {campaignId}
            </p>
          )}
          {!isAdmin && (
            <p className="text-sm text-red-500 mt-2">{t("Only Charity Admin can manage stories.")}</p>
          )}
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-lg font-semibold">
                {t("Story Title")}
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={t("e.g., How Volunteers Helped Rebuild a Community")}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="content" className="text-lg font-semibold">
                {t("Story Content")}
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder={t("Describe the story in detail...")}
                className="mt-2 min-h-[200px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="authorName" className="text-lg font-semibold">
                  {t("Author Name")}
                </Label>
                <Input
                  id="authorName"
                  value={authorName}
                  onChange={(event) => setAuthorName(event.target.value)}
                  placeholder={t("e.g., Hana Solomon")}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="authorRole" className="text-lg font-semibold">
                  {t("Author Role")}
                </Label>
                <Select value={authorRole} onValueChange={setAuthorRole}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder={t("Select author role")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beneficiary">{t("Beneficiary")}</SelectItem>
                    <SelectItem value="Volunteer">{t("Volunteer")}</SelectItem>
                    <SelectItem value="Donor">{t("Donor")}</SelectItem>
                    <SelectItem value="Staff">{t("Staff")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="authorId" className="text-lg font-semibold">
                  {t("Author ID")}
                </Label>
                <Input
                  id="authorId"
                  value={authorId}
                  onChange={(event) => setAuthorId(event.target.value)}
                  placeholder={t("Optional admin author ID")}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {t("Optional: provide the user ID of an existing author to link the story to that profile.")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="category" className="text-lg font-semibold">
                  {t("Story Category")}
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder={t("Select a category")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Impact Story">{t("Impact Story")}</SelectItem>
                    <SelectItem value="Volunteer Spotlight">{t("Volunteer Spotlight")}</SelectItem>
                    <SelectItem value="Donor Story">{t("Donor Story")}</SelectItem>
                    <SelectItem value="Emergency Relief">{t("Emergency Relief")}</SelectItem>
                    <SelectItem value="Education">{t("Education")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="image" className="text-lg font-semibold">
                  {t("Image URL")}
                </Label>
                <Input
                  id="image"
                  value={image}
                  onChange={(event) => setImage(event.target.value)}
                  placeholder={t("https://example.com/story-photo.jpg")}
                  className="mt-2"
                />
                <Label htmlFor="imageFile" className="text-lg font-semibold mt-4 block">
                  {t("Upload Image")}
                </Label>
                <input
                  id="imageFile"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {isEditing
                    ? t("Leave this empty to keep the current image, or upload a new one to replace it.")
                    : t("Upload a story image file or provide an image URL.")}
                </p>
                {previewUrl ? (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-muted-foreground">{t("Current image preview")}</p>
                    <img src={previewUrl} alt={t("Story preview") as string} className="mt-2 h-40 w-full object-cover rounded-lg" />
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Input
                id="published"
                type="checkbox"
                checked={published}
                onChange={(event) => setPublished(event.target.checked)}
                className="h-4 w-4 rounded"
              />
              <Label htmlFor="published" className="text-sm font-medium">
                {t("Publish story immediately")}
              </Label>
            </div>

            <div className="pt-6">
              <Button onClick={handleSubmit} disabled={!isAdmin || isSubmitting} className="w-full">
                {isEditing ? t("Update Story") : t("Create Story")}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
