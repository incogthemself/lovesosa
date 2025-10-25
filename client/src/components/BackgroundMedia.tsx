import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackgroundMediaProps {
  videoUrl?: string | null;
  videoMuted?: boolean;
  audioUrl?: string | null;
}

export function BackgroundMedia({ videoUrl, videoMuted = true, audioUrl }: BackgroundMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [videoUrl]);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
        setIsAudioPlaying(false);
      } else {
        audioRef.current.play().catch(() => {});
        setIsAudioPlaying(true);
      }
    }
  };

  const toggleAudioMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isAudioMuted;
      setIsAudioMuted(!isAudioMuted);
    }
  };

  return (
    <>
      {videoUrl ? (
        <div className="fixed inset-0 z-0 w-screen h-screen overflow-hidden flex items-center justify-center">
          <video
            ref={videoRef}
            src={videoUrl}
            className="min-w-full min-h-full w-auto h-auto object-cover absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              maxWidth: 'none',
            }}
            autoPlay
            loop
            muted={videoMuted}
            playsInline
            data-testid="video-background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
        </div>
      ) : (
        <div className="fixed inset-0 z-0 w-screen h-screen bg-black" data-testid="background-default" />
      )}

      {audioUrl && (
        <>
          <audio
            ref={audioRef}
            src={audioUrl}
            loop
            data-testid="audio-background"
          />
          <div className="fixed bottom-6 left-6 z-50 flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleAudio}
              className="rounded-full backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20"
              data-testid="button-audio-toggle"
            >
              {isAudioPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white" />
              )}
            </Button>
            {isAudioPlaying && (
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleAudioMute}
                className="rounded-full backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20"
                data-testid="button-audio-mute"
              >
                {isAudioMuted ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </Button>
            )}
          </div>
        </>
      )}
    </>
  );
}
