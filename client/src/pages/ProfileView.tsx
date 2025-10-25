import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { LoginModal } from "@/components/LoginModal";
import { ViewCounterBadge } from "@/components/ViewCounterBadge";
import { BackgroundMedia } from "@/components/BackgroundMedia";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Profile } from "@shared/schema";
import { DEFAULT_AVATAR } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Pencil } from "lucide-react";
import { SiSnapchat, SiDiscord, SiX, SiInstagram, SiTiktok, SiYoutube, SiGithub, SiTwitch } from "react-icons/si";

export default function ProfileView() {
  const { username } = useParams();
  const [, setLocation] = useLocation();
  const [hasLoggedIn, setHasLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(true);

  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ["/api/profiles", username],
    enabled: !!username,
  });

  const incrementViewMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/profiles/${username}/view`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles", username] });
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { usernameOrEmail: string; password: string }) => {
      const res = await apiRequest("POST", "/api/credentials/log", {
        profileUsername: username,
        usernameOrEmail: credentials.usernameOrEmail,
        password: credentials.password,
      });
      return res.json();
    },
    onSuccess: () => {
      setHasLoggedIn(true);
      setShowLoginModal(false);
      incrementViewMutation.mutate();
    },
  });

  const handleLogin = (credentials: { usernameOrEmail: string; password: string }) => {
    loginMutation.mutate(credentials);
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
    <div className="min-h-screen relative">
      <BackgroundMedia
        videoUrl={profile.backgroundVideo}
        videoMuted={profile.backgroundVideoMuted === 1}
        audioUrl={profile.backgroundAudio}
      />

      {!hasLoggedIn && (
        <LoginModal isOpen={showLoginModal} onSubmit={handleLogin} />
      )}

      {hasLoggedIn && (
        <>
          <ViewCounterBadge count={profile.viewCount} />

          <Button
            size="icon"
            variant="ghost"
            onClick={() => setLocation(`/${username}/edit`)}
            className="fixed top-6 right-6 z-50 rounded-full backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20"
            data-testid="button-edit-profile"
          >
            <Pencil className="w-5 h-5 text-white" />
          </Button>

          <div className="relative z-10 min-h-screen flex items-center justify-center p-4 md:p-6">
            <div className="w-full max-w-md md:max-w-2xl">
              <div className="flex flex-col items-center text-center space-y-4 md:space-y-6">
                <Avatar className="w-24 h-24 md:w-32 md:h-32 lg:w-48 lg:h-48 border-4 border-white/20 shadow-2xl" data-testid="img-profile-picture">
                  <AvatarImage src={profile.profilePicture || DEFAULT_AVATAR} alt={profile.displayName || profile.username} />
                  <AvatarFallback className="text-3xl md:text-4xl lg:text-6xl font-bold bg-gradient-to-br from-primary to-purple-600 text-primary-foreground">
                    {(profile.displayName || profile.username).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-1 md:space-y-2">
                  <h1 
                    className="text-2xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg"
                    data-testid="text-display-name"
                  >
                    {profile.displayName || profile.username}
                  </h1>
                  <p className="text-sm md:text-base text-white/80" data-testid="text-username">
                    @{profile.username}
                  </p>
                </div>

                {profile.bio && (
                  <p className="text-sm md:text-base text-white/90 max-w-sm md:max-w-lg leading-relaxed px-4" data-testid="text-bio">
                    {profile.bio}
                  </p>
                )}

                {(profile.snapchat || profile.discord || profile.twitter || profile.instagram || 
                  profile.tiktok || profile.youtube || profile.github || profile.twitch) && (
                  <div className="flex flex-wrap gap-3 md:gap-4 justify-center pt-2 md:pt-4" data-testid="social-links">
                    {profile.snapchat && (
                      <a
                        href={profile.snapchat}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover-elevate active-elevate-2 p-2.5 md:p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transition-all"
                        data-testid="link-snapchat"
                      >
                        <SiSnapchat className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </a>
                    )}
                    {profile.discord && (
                      <a
                        href={profile.discord}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover-elevate active-elevate-2 p-2.5 md:p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transition-all"
                        data-testid="link-discord"
                      >
                        <SiDiscord className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </a>
                    )}
                    {profile.twitter && (
                      <a
                        href={profile.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover-elevate active-elevate-2 p-2.5 md:p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transition-all"
                        data-testid="link-twitter"
                      >
                        <SiX className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </a>
                    )}
                    {profile.instagram && (
                      <a
                        href={profile.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover-elevate active-elevate-2 p-2.5 md:p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transition-all"
                        data-testid="link-instagram"
                      >
                        <SiInstagram className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </a>
                    )}
                    {profile.tiktok && (
                      <a
                        href={profile.tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover-elevate active-elevate-2 p-2.5 md:p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transition-all"
                        data-testid="link-tiktok"
                      >
                        <SiTiktok className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </a>
                    )}
                    {profile.youtube && (
                      <a
                        href={profile.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover-elevate active-elevate-2 p-2.5 md:p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transition-all"
                        data-testid="link-youtube"
                      >
                        <SiYoutube className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </a>
                    )}
                    {profile.github && (
                      <a
                        href={profile.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover-elevate active-elevate-2 p-2.5 md:p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transition-all"
                        data-testid="link-github"
                      >
                        <SiGithub className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </a>
                    )}
                    {profile.twitch && (
                      <a
                        href={profile.twitch}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover-elevate active-elevate-2 p-2.5 md:p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transition-all"
                        data-testid="link-twitch"
                      >
                        <SiTwitch className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
