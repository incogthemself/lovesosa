import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { X, Upload, Loader2, Music, Video, User } from "lucide-react";
import { DEFAULT_AVATAR } from "@shared/schema";

const formSchema = z.object({
  username: z.string().min(3).regex(/^[a-zA-Z0-9_]+$/),
  displayName: z.string().nullable().optional(),
  bio: z.string().max(500).nullable().optional(),
  backgroundVideoMuted: z.number().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AssetUpload {
  file: File | null;
  preview: string | null;
  serverPath: string | null;
  filename: string | null;
  assetType: "profile" | "background" | "audio";
}

export default function Customize() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [profilePicture, setProfilePicture] = useState<AssetUpload>({
    file: null,
    preview: null,
    serverPath: null,
    filename: null,
    assetType: "profile"
  });
  
  const [backgroundVideo, setBackgroundVideo] = useState<AssetUpload>({
    file: null,
    preview: null,
    serverPath: null,
    filename: null,
    assetType: "background"
  });
  
  const [backgroundAudio, setBackgroundAudio] = useState<AssetUpload>({
    file: null,
    preview: null,
    serverPath: null,
    filename: null,
    assetType: "audio"
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      displayName: null,
      bio: null,
      backgroundVideoMuted: 1,
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ fileData, fileType }: { fileData: string; fileType: string }) => {
      const res = await apiRequest("POST", "/api/upload", { fileData, fileType });
      return res.json();
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: any) => {
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
        description: error.message || "Failed to create profile.",
        variant: "destructive",
      });
    },
  });

  const handleFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAssetUpload = async (
    file: File,
    assetType: "profile" | "background" | "audio",
    setter: React.Dispatch<React.SetStateAction<AssetUpload>>
  ) => {
    try {
      // Create preview immediately for better UX
      const preview = URL.createObjectURL(file);
      
      setter(prev => ({
        ...prev,
        file,
        preview,
        serverPath: null,
        filename: null
      }));

      // Convert to base64 for upload (will be immediately converted to Buffer on server)
      const base64 = await handleFileToBase64(file);
      
      const result = await uploadMutation.mutateAsync({
        fileData: base64,
        fileType: assetType
      });

      setter(prev => ({
        ...prev,
        serverPath: result.path,
        filename: result.filename
      }));

      toast({
        title: "Upload Successful",
        description: "File uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
      // Reset but preserve assetType
      setter(prev => ({
        file: null,
        preview: null,
        serverPath: null,
        filename: null,
        assetType: prev.assetType
      }));
    }
  };

  const handleRemoveAsset = async (
    asset: AssetUpload,
    setter: React.Dispatch<React.SetStateAction<AssetUpload>>
  ) => {
    // Clean up preview URL
    if (asset.preview) {
      URL.revokeObjectURL(asset.preview);
    }

    // Delete file from server if it was uploaded
    if (asset.filename) {
      try {
        await apiRequest("DELETE", `/api/upload/${asset.filename}`, {});
      } catch (error) {
        console.error("Failed to delete file from server:", error);
      }
    }

    // Reset state but preserve assetType
    setter(prev => ({
      file: null,
      preview: null,
      serverPath: null,
      filename: null,
      assetType: prev.assetType
    }));
  };

  const onSubmit = async (data: FormData) => {
    // Check if any files are selected but not yet uploaded
    const hasPendingUploads = 
      (profilePicture.file && !profilePicture.serverPath) ||
      (backgroundVideo.file && !backgroundVideo.serverPath) ||
      (backgroundAudio.file && !backgroundAudio.serverPath);

    if (hasPendingUploads) {
      toast({
        title: "Upload in Progress",
        description: "Please wait for all files to finish uploading before saving.",
        variant: "destructive",
      });
      return;
    }

    const profileData = {
      ...data,
      profilePicture: profilePicture.serverPath,
      backgroundVideo: backgroundVideo.serverPath,
      backgroundAudio: backgroundAudio.serverPath,
      backgroundVideoMuted: data.backgroundVideoMuted ?? 1,
    };

    createProfileMutation.mutate(profileData);
  };

  const getFileExtension = (file: File | null): string => {
    if (!file) return "";
    const ext = file.name.split('.').pop()?.toUpperCase();
    return ext || "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-purple-950/20">
      <div className="container mx-auto max-w-6xl py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Customize Profile
          </h1>
          <p className="text-muted-foreground mt-2">
            Upload your assets and personalize your profile
          </p>
        </div>

        <div className="space-y-8">
          {/* Assets Uploader */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Assets Uploader</CardTitle>
              <CardDescription>
                Upload your background video, audio, and profile picture
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Background Video */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Background
                  </label>
                  <div 
                    className="relative aspect-video rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 hover-elevate overflow-hidden"
                    data-testid="upload-background"
                  >
                    {backgroundVideo.preview ? (
                      <>
                        <video 
                          src={backgroundVideo.preview}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          autoPlay
                        />
                        <Badge className="absolute top-2 left-2 bg-background/80 backdrop-blur">
                          .{getFileExtension(backgroundVideo.file)}
                        </Badge>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2"
                          onClick={() => handleRemoveAsset(backgroundVideo, setBackgroundVideo)}
                          data-testid="button-remove-background"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-full cursor-pointer p-4 text-center">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Click to upload video</span>
                        <Input
                          type="file"
                          accept="video/mp4,video/webm"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleAssetUpload(file, "background", setBackgroundVideo);
                          }}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  {uploadMutation.isPending && backgroundVideo.file && !backgroundVideo.serverPath && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </div>
                  )}
                </div>

                {/* Audio */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    Audio
                  </label>
                  <div 
                    className="relative aspect-video rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 hover-elevate overflow-hidden"
                    data-testid="upload-audio"
                  >
                    {backgroundAudio.preview ? (
                      <>
                        <div className="flex flex-col items-center justify-center h-full p-4">
                          <Music className="w-12 h-12 mb-2 text-primary" />
                          <span className="text-sm font-medium truncate max-w-full">
                            {backgroundAudio.file?.name}
                          </span>
                        </div>
                        <Badge className="absolute top-2 left-2 bg-background/80 backdrop-blur">
                          .{getFileExtension(backgroundAudio.file)}
                        </Badge>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2"
                          onClick={() => handleRemoveAsset(backgroundAudio, setBackgroundAudio)}
                          data-testid="button-remove-audio"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-full cursor-pointer p-4 text-center">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Click to upload audio</span>
                        <Input
                          type="file"
                          accept="audio/mp3,audio/wav,audio/mpeg"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleAssetUpload(file, "audio", setBackgroundAudio);
                          }}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  {uploadMutation.isPending && backgroundAudio.file && !backgroundAudio.serverPath && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </div>
                  )}
                </div>

                {/* Profile Avatar */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Profile Avatar
                  </label>
                  <div 
                    className="relative aspect-video rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 hover-elevate overflow-hidden"
                    data-testid="upload-avatar"
                  >
                    {profilePicture.preview ? (
                      <>
                        <img 
                          src={profilePicture.preview}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                        <Badge className="absolute top-2 left-2 bg-background/80 backdrop-blur">
                          .{getFileExtension(profilePicture.file)}
                        </Badge>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2"
                          onClick={() => handleRemoveAsset(profilePicture, setProfilePicture)}
                          data-testid="button-remove-avatar"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-full cursor-pointer p-4 text-center">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Click to upload image</span>
                        <Input
                          type="file"
                          accept="image/*,image/gif"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleAssetUpload(file, "profile", setProfilePicture);
                          }}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  {uploadMutation.isPending && profilePicture.file && !profilePicture.serverPath && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* General Customization */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">General Customization</CardTitle>
              <CardDescription>
                Set up your profile information
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
                        <FormLabel>Username *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="your_username"
                            {...field}
                            data-testid="input-username"
                          />
                        </FormControl>
                        <FormDescription>
                          Your unique identifier
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
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your Name"
                            {...field}
                            value={field.value || ""}
                            data-testid="input-display-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell visitors about yourself..."
                            className="resize-none min-h-24"
                            {...field}
                            value={field.value || ""}
                            data-testid="input-bio"
                          />
                        </FormControl>
                        <FormDescription>
                          A short description (max 500 characters)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {backgroundVideo.serverPath && (
                    <FormField
                      control={form.control}
                      name="backgroundVideoMuted"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Mute Video Audio</FormLabel>
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

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      createProfileMutation.isPending ||
                      uploadMutation.isPending ||
                      !!(profilePicture.file && !profilePicture.serverPath) ||
                      !!(backgroundVideo.file && !backgroundVideo.serverPath) ||
                      !!(backgroundAudio.file && !backgroundAudio.serverPath)
                    }
                    data-testid="button-save"
                  >
                    {createProfileMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : uploadMutation.isPending ||
                      (profilePicture.file && !profilePicture.serverPath) ||
                      (backgroundVideo.file && !backgroundVideo.serverPath) ||
                      (backgroundAudio.file && !backgroundAudio.serverPath) ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading files...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
