import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertProfileSchema, type Profile } from "@shared/schema";
import { Loader2, ArrowLeft } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const formSchema = insertProfileSchema.omit({ username: true }).extend({
  snapchat: z.string().optional(),
  discord: z.string().optional(),
  twitter: z.string().optional(),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
  youtube: z.string().optional(),
  github: z.string().optional(),
  twitch: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function EditProfile() {
  const { username } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [backgroundVideoFile, setBackgroundVideoFile] = useState<File | null>(null);
  const [backgroundAudioFile, setBackgroundAudioFile] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);

  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ["/api/profiles", username],
    enabled: !!username,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: "",
      bio: "",
      profilePicture: "",
      backgroundVideo: "",
      backgroundVideoMuted: 1,
      backgroundAudio: "",
      snapchat: "",
      discord: "",
      twitter: "",
      instagram: "",
      tiktok: "",
      youtube: "",
      github: "",
      twitch: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        displayName: profile.displayName || "",
        bio: profile.bio || "",
        profilePicture: profile.profilePicture || "",
        backgroundVideo: profile.backgroundVideo || "",
        backgroundVideoMuted: profile.backgroundVideoMuted || 1,
        backgroundAudio: profile.backgroundAudio || "",
        snapchat: profile.snapchat || "",
        discord: profile.discord || "",
        twitter: profile.twitter || "",
        instagram: profile.instagram || "",
        tiktok: profile.tiktok || "",
        youtube: profile.youtube || "",
        github: profile.github || "",
        twitch: profile.twitch || "",
      });
      setProfilePicturePreview(profile.profilePicture || null);
    }
  }, [profile, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await apiRequest("PUT", `/api/profiles/${username}`, data);
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Profile Updated!",
        description: `Your profile has been updated successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profiles", username] });
      setLocation(`/${username}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    const cleanedData = {
      ...data,
      displayName: data.displayName || undefined,
      bio: data.bio || undefined,
      profilePicture: data.profilePicture || undefined,
      backgroundVideo: data.backgroundVideo || undefined,
      backgroundVideoMuted: data.backgroundVideoMuted,
      backgroundAudio: data.backgroundAudio || undefined,
      snapchat: data.snapchat || undefined,
      discord: data.discord || undefined,
      twitter: data.twitter || undefined,
      instagram: data.instagram || undefined,
      tiktok: data.tiktok || undefined,
      youtube: data.youtube || undefined,
      github: data.github || undefined,
      twitch: data.twitch || undefined,
    };
    
    updateProfileMutation.mutate(cleanedData);
  };

  const handleFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePictureFile(file);
      const base64 = await handleFileToBase64(file);
      form.setValue("profilePicture", base64, { shouldValidate: true, shouldDirty: true });
      setProfilePicturePreview(base64);
    }
  };

  const handleBackgroundVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackgroundVideoFile(file);
      const base64 = await handleFileToBase64(file);
      form.setValue("backgroundVideo", base64, { shouldValidate: true, shouldDirty: true });
    }
  };

  const handleBackgroundAudioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackgroundAudioFile(file);
      const base64 = await handleFileToBase64(file);
      form.setValue("backgroundAudio", base64, { shouldValidate: true, shouldDirty: true });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground text-lg">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
            <p className="text-muted-foreground">
              The profile @{username} doesn't exist.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-purple-950/20 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => setLocation(`/${username}`)}
          className="mb-4"
          data-testid="button-back"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Profile
        </Button>

        <Card className="border-purple-500/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold font-display bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Edit Your Profile
            </CardTitle>
            <CardDescription className="text-base">
              Update your profile information, media, and social links
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24 border-4 border-primary shadow-lg" data-testid="img-profile-preview">
                    <AvatarImage src={profilePicturePreview || profile.profilePicture || undefined} alt={profile.displayName || profile.username} />
                    <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary to-purple-600 text-primary-foreground">
                      {(profile.displayName || profile.username).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <FormLabel className="text-base font-semibold">Profile Picture</FormLabel>
                    <Input
                      type="file"
                      accept="image/*,image/gif"
                      onChange={handleProfilePictureChange}
                      className="mt-2 h-12 cursor-pointer"
                      data-testid="input-profile-picture"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload an image or GIF for your profile picture
                    </p>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Display Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your Name"
                          className="h-12"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-display-name"
                        />
                      </FormControl>
                      <FormDescription>
                        The name shown on your profile
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell visitors about yourself..."
                          className="min-h-24 resize-none"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-bio"
                        />
                      </FormControl>
                      <FormDescription>
                        A short description about you (max 500 characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel className="text-base font-semibold">Background Video</FormLabel>
                  <Input
                    type="file"
                    accept="video/mp4,video/webm"
                    onChange={handleBackgroundVideoChange}
                    className="h-12 cursor-pointer"
                    data-testid="input-background-video"
                  />
                  <p className="text-sm text-muted-foreground">
                    Add a video background to your profile (MP4 or WebM)
                  </p>
                  {backgroundVideoFile && (
                    <p className="text-sm text-primary">
                      New video selected: {backgroundVideoFile.name}
                    </p>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="backgroundVideoMuted"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Mute Video Audio</FormLabel>
                        <FormDescription>
                          Keep video audio muted by default
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value === 1}
                          onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                          data-testid="switch-video-muted"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel className="text-base font-semibold">Background Audio</FormLabel>
                  <Input
                    type="file"
                    accept="audio/mp3,audio/wav,audio/mpeg"
                    onChange={handleBackgroundAudioChange}
                    className="h-12 cursor-pointer"
                    data-testid="input-background-audio"
                  />
                  <p className="text-sm text-muted-foreground">
                    Add background music to your profile (MP3 or WAV)
                  </p>
                  {backgroundAudioFile && (
                    <p className="text-sm text-primary">
                      New audio selected: {backgroundAudioFile.name}
                    </p>
                  )}
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                    Social Media Links
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="snapchat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Snapchat</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://snapchat.com/..."
                              {...field}
                              value={field.value || ""}
                              data-testid="input-snapchat"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="discord"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discord</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://discord.gg/..."
                              {...field}
                              value={field.value || ""}
                              data-testid="input-discord"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="twitter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twitter/X</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://twitter.com/..."
                              {...field}
                              value={field.value || ""}
                              data-testid="input-twitter"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="instagram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://instagram.com/..."
                              {...field}
                              value={field.value || ""}
                              data-testid="input-instagram"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tiktok"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>TikTok</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://tiktok.com/@..."
                              {...field}
                              value={field.value || ""}
                              data-testid="input-tiktok"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="youtube"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>YouTube</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://youtube.com/..."
                              {...field}
                              value={field.value || ""}
                              data-testid="input-youtube"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="github"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GitHub</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://github.com/..."
                              {...field}
                              value={field.value || ""}
                              data-testid="input-github"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="twitch"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twitch</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://twitch.tv/..."
                              {...field}
                              value={field.value || ""}
                              data-testid="input-twitch"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation(`/${username}`)}
                    className="flex-1"
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-12 text-base font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg"
                    disabled={updateProfileMutation.isPending}
                    data-testid="button-save"
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
