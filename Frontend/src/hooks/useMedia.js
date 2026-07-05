import { useRef, useState } from "react";
import { socket } from "../socket/socket";

export default function useMedia(roomId) {
  const localStream = useRef(null);
  const [micEnabled, setMicEnabled] = useState(false);

  async function initMedia() {
    if (localStream.current) return;

    try {
      localStream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      // Start muted
      const audioTrack = localStream.current.getAudioTracks()[0];
      audioTrack.enabled = false;
    } catch (err) {
      console.error(err);
    }
  }

  async function toggleMic() {
    await initMedia();

    const audioTrack = localStream.current.getAudioTracks()[0];

    audioTrack.enabled = !audioTrack.enabled;

    setMicEnabled(audioTrack.enabled);

    socket.emit("mic-status", {
      roomId,
      enabled: audioTrack.enabled,
    });
  }

  return {
    localStream,
    toggleMic,
    micEnabled,
  };
}
