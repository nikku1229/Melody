import { createContext, useContext, useEffect, useRef, useState } from "react";
import { songs } from "../data/songs";

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const audioRef = useRef(new Audio());

  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState("off");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  /* 🔹 QUEUE SYSTEM */
  const [activeQueue, setActiveQueue] = useState(songs.map((_, i) => i));
  const [queueIndex, setQueueIndex] = useState(0);

  /* 🔹 CURRENT SONG */
  const currentSongIndex = activeQueue[queueIndex];
  const currentSong = songs[currentSongIndex];

  /* 🔹 PLAYLISTS */
  const [playlists, setPlaylists] = useState(() => {
    const saved = localStorage.getItem("melody_playlists");
    return saved ? JSON.parse(saved) : [];
  });

  /* 🔹 AUDIO SYNC */
  useEffect(() => {
    const audio = audioRef.current;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const setMeta = () => setDuration(audio.duration || 0);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", setMeta);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", setMeta);
    };
  }, []);

  const seekTo = (time) => {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  /* 🔹 LOAD SONG */
  useEffect(() => {
    if (!currentSong) return;

    const audio = audioRef.current;
    audio.src = currentSong.src;
    audio.load();

    if (isPlaying) {
      audio.play().catch(() => {});
    }
  }, [currentSongIndex]);

  /* 🔹 PLAY / PAUSE / RESUME */
  const playSong = (index, queue = null) => {
    const audio = audioRef.current;

    if (queue) {
      setActiveQueue(queue);
      setQueueIndex(queue.indexOf(index));
    } else {
      setQueueIndex(index);
    }
    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => {});
  };

  const pauseSong = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const resumeSong = () => {
    const audio = audioRef.current;
    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => {});
  };

  /* 🔹 NEXT / PREV */
  const nextSong = () => {
    const audio = audioRef.current;

    if (repeatMode === "one") {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }

    let nextIndex = queueIndex;

    if (queueIndex < activeQueue.length - 1) {
      nextIndex++;
    } else if (repeatMode === "all") {
      nextIndex = 0;
    } else {
      setIsPlaying(false);
      return;
    }
    setQueueIndex(nextIndex);
    audio.play();
  };

  const prevSong = () => {
    if (queueIndex === 0) return;

    setQueueIndex(queueIndex - 1);
    audioRef.current.play();
  };

  /* 🔹 AUTO NEXT */
  useEffect(() => {
    const audio = audioRef.current;
    audio.addEventListener("ended", nextSong);
    return () => audio.removeEventListener("ended", nextSong);
  }, [queueIndex, repeatMode]);

  /* 🔹 SHUFFLE */
  const toggleShuffle = () => {
    if (!isShuffle) {
      const shuffled = [...activeQueue].sort(() => Math.random() - 0.5);
      setActiveQueue(shuffled);
      setQueueIndex(0);
    }
    setIsShuffle((p) => !p);
  };

  /* 🔹 REPEAT */
  const toggleRepeat = () => {
    setRepeatMode((p) => (p === "off" ? "all" : p === "all" ? "one" : "off"));
  };

  /* 🔹 PLAY PLAYLIST */
  const playPlaylist = (songIds) => {
    const queue = songIds.map((id) => songs.findIndex((s) => s.id === id));
    if (!queue.length) return;

    setActiveQueue(queue);
    setQueueIndex(0);
    setIsPlaying(true);
  };

  /* 🔹 PLAYLIST CRUD */
  const createPlaylist = (name) => {
    setPlaylists((p) => [...p, { id: Date.now(), name, songIds: [] }]);
  };

  const addSongToPlaylist = (playlistId, songId) => {
    setPlaylists((p) =>
      p.map((pl) =>
        pl.id === playlistId
          ? { ...pl, songIds: [...new Set([...pl.songIds, songId])] }
          : pl
      )
    );
  };

  const deletePlaylist = (playlistId) => {
    setPlaylists((p) => p.filter((pl) => pl.id !== playlistId));
  };

  const removeSongFromPlaylist = (playlistId, songId) => {
    setPlaylists((p) =>
      p.map((pl) =>
        pl.id === playlistId
          ? { ...pl, songIds: pl.songIds.filter((id) => id !== songId) }
          : pl
      )
    );
  };

  /* 🔹 SAVE */
  useEffect(() => {
    localStorage.setItem("melody_playlists", JSON.stringify(playlists));
  }, [playlists]);

  /* 🔹 PLAY SESSIONS */
  useEffect(() => {
    if (!("mediaSession" in navigator) || !currentSong) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.title,
      artist: currentSong.artist,
      album: "Your Music App",
      artwork: [
        { src: currentSong.cover, sizes: "96x96", type: "image/png" },
        { src: currentSong.cover, sizes: "192x192", type: "image/png" },
        { src: currentSong.cover, sizes: "512x512", type: "image/png" },
      ],
    });

    navigator.mediaSession.setActionHandler("play", resumeSong);
    navigator.mediaSession.setActionHandler("pause", pauseSong);
    navigator.mediaSession.setActionHandler("nexttrack", nextSong);
    navigator.mediaSession.setActionHandler("previoustrack", prevSong);
  }, [currentSong, isPlaying]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [isPlaying]);

  /* 🔹 KEYBOARD GESTURE */
  useEffect(() => {
    const handleKey = (e) => {
      if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;

      if (e.code === "Space") {
        e.preventDefault();
        isPlaying ? pauseSong() : resumeSong();
      }

      if (e.code === "ArrowRight") nextSong();
      if (e.code === "ArrowLeft") prevSong();
      if (e.key.toLowerCase() === "m") toggleMute();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isPlaying]);

  /* 🔹 MUTE SYSTEM */
  useEffect(() => {
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const toggleMute = () => setIsMuted((m) => !m);

  return (
    <PlayerContext.Provider
      value={{
        audioRef,
        currentSong,
        isPlaying,
        playSong,
        pauseSong,
        resumeSong,
        nextSong,
        prevSong,
        toggleShuffle,
        toggleRepeat,
        isShuffle,
        repeatMode,
        playlists,
        createPlaylist,
        addSongToPlaylist,
        deletePlaylist,
        removeSongFromPlaylist,
        playPlaylist,
        currentTime,
        duration,
        seekTo,
        volume,
        setVolume,
        isMuted,
        toggleMute,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
