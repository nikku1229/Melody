import { useEffect, useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { usePlayer } from "../context/PlayerContext";
import "../styles/player.css";

const MusicPlayer = () => {
  const {
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
    currentTime,
    duration,
    seekTo,
    volume,
    setVolume,
    isMuted,
    toggleMute,
  } = usePlayer();

  const playerRef = useRef(null);
  const playBtnRef = useRef(null);
  const songInfoRef = useRef(null);
  const progressRef = useRef(null);

  const formatTime = (time) => {
    if (!time) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${min}:${sec}`;
  };

  useLayoutEffect(() => {
    if (!playerRef.current) return;

    gsap.set(playerRef.current, {
      opacity: 0,
      y: 100,
    });

    gsap.from(playerRef.current, {
      y: 0,
      opacity: 1,
      duration: 0.2,
      ease: "power3.out",
    });
  }, []);

  useEffect(() => {
    if (!playBtnRef.current) return;

    gsap.fromTo(
      playBtnRef.current,
      { scale: 0.85 },
      {
        scale: 1,
        duration: 0.25,
        ease: "back.out(2)",
      }
    );
  }, [isPlaying]);

  useEffect(() => {
    if (!songInfoRef.current || !currentSong) return;

    gsap.fromTo(
      songInfoRef.current,
      { opacity: 0, y: 0 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: "power2.out",
      }
    );
  }, [currentSong]);

  useEffect(() => {
    if (!playerRef.current) return;

    if (isPlaying) {
      gsap.to(playerRef.current, {
        boxShadow: "0 0 25px rgba(255,255,255,0.25)",
        repeat: -1,
        yoyo: true,
        duration: 1.2,
        ease: "sine.inOut",
      });
    } else {
      gsap.killTweensOf(playerRef.current);
      gsap.to(playerRef.current, {
        boxShadow: "0 0 0 rgba(255,255,255,0)",
        duration: 0.3,
      });
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!progressRef.current || !duration) return;

    gsap.to(progressRef.current, {
      width: `${(currentTime / duration) * 100}%`,
      duration: 0.2,
      ease: "linear",
    });
  }, [currentTime]);

  useEffect(() => {
    gsap.fromTo(".volume-icon", { scale: 0.8 }, { scale: 1, duration: 0.3 });
  }, [isMuted]);

  if (!currentSong) return null;

  return (
    <div ref={playerRef} className="player glass">
      <div ref={songInfoRef} className="song-info">
        <img src={currentSong.cover} alt="cover" loading="lazy" />
        <div>
          <h4>{currentSong.title}</h4>
          <p>{currentSong.artist}</p>
        </div>
      </div>

      <div className="controls">
        <div className="controller-btn">
          <button onClick={prevSong}>⏮</button>

          {isPlaying ? (
            <button ref={playBtnRef} onClick={pauseSong}>
              ⏸
            </button>
          ) : (
            <button ref={playBtnRef} onClick={resumeSong}>
              ▶
            </button>
          )}

          <button onClick={nextSong}>⏭</button>
        </div>

        <div className="progress-container">
          <span>{formatTime(currentTime)}</span>

          <div
            className="progress-bar"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const percent = clickX / rect.width;
              seekTo(percent * duration);
            }}
          >
            <div
              ref={progressRef}
              className="progress-fill"
              style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
            />
          </div>

          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="extra">
        <div className="vol">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
          />

          <button onClick={toggleMute}>{isMuted ? "🔇" : "🔊"}</button>
        </div>

        <div className="extra-btn">
          <button
            style={{ opacity: isShuffle ? 1 : 0.5 }}
            onClick={toggleShuffle}
          >
            🔀
          </button>

          <button onClick={toggleRepeat}>
            {repeatMode === "off" && "🔄"}
            {repeatMode === "all" && "🔁"}
            {repeatMode === "one" && "🔂"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
