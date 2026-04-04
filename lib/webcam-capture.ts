/**
 * Capture a frame from the user's webcam video element and return as base64 data URI.
 * Looks for video elements rendered by the UserVideo component.
 */
export function captureWebcamFrame(): string | null {
  // The UserVideo component renders a <video> element
  const videos = document.querySelectorAll('video');
  // Find the local user video (not the avatar video)
  // The user video is typically the smaller one or the one with muted attribute
  let userVideo: HTMLVideoElement | null = null;

  for (const video of videos) {
    if (video.muted && video.srcObject) {
      userVideo = video;
      break;
    }
  }

  if (!userVideo || userVideo.videoWidth === 0) return null;

  const canvas = document.createElement('canvas');
  canvas.width = userVideo.videoWidth;
  canvas.height = userVideo.videoHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.drawImage(userVideo, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.8);
}
