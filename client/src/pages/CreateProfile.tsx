import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
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
import { apiRequest } from "@/lib/queryClient";
import { insertProfileSchema } from "@shared/schema";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  displayName: z.string().nullable().optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").nullable().optional(),
  profilePicture: z.string().nullable().optional(),
  backgroundVideo: z.string().nullable().optional(),
  backgroundVideoMuted: z.number().optional(),
  backgroundAudio: z.string().nullable().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateProfile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [backgroundVideoFile, setBackgroundVideoFile] = useState<File | null>(null);
  const [backgroundAudioFile, setBackgroundAudioFile] = useState<File | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      displayName: null,
      bio: null,
      profilePicture: null,
      backgroundVideo: null,
      backgroundVideoMuted: 1,
      backgroundAudio: null,
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await apiRequest("POST", "/api/profiles", data);
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Profile Created!",
        description: `Your profile @${data.username} has been created successfully.`,
      });
      setLocation(`/${data.username}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create profile. Username might already exist.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    console.log("Form submitted with data:", data);
    console.log("Form errors:", form.formState.errors);
    
    const cleanedData = {
      ...data,
      displayName: data.displayName || null,
      bio: data.bio || null,
      profilePicture: data.profilePicture || null,
      backgroundVideo: data.backgroundVideo || null,
      backgroundAudio: data.backgroundAudio || null,
      backgroundVideoMuted: data.backgroundVideoMuted ?? 1,
    };
    
    createProfileMutation.mutate(cleanedData);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-purple-950/20 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Card className="border-purple-500/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold font-display bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Create Your Profile
            </CardTitle>
            <CardDescription className="text-base">
              Customize your profile with videos, music, and more
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Username *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="your_username"
                          className="h-12"
                          {...field}
                          data-testid="input-username"
                        />
                      </FormControl>
                      <FormDescription>
                        Your unique identifier. Only letters, numbers, and underscores.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                  <FormLabel className="text-base font-semibold">Profile Picture</FormLabel>
                  <Input
                    type="file"
                    accept="image/*,image/gif"
                    onChange={handleProfilePictureChange}
                    className="h-12 cursor-pointer"
                    data-testid="input-profile-picture"
                  />
                  <p className="text-sm text-muted-foreground">
                    Upload an image or GIF for your profile picture
                  </p>
                </div>

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
                </div>

                {backgroundVideoFile && (
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
                )}

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
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg"
                  disabled={createProfileMutation.isPending}
                  data-testid="button-create"
                >
                  {createProfileMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Profile...
                    </>
                  ) : (
                    "Create Profile"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
