import { useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { songs } from "../data/songs";

const Playlists = () => {
  const {
    playlists,
    createPlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    playSong,
    playPlaylist,
  } = usePlayer();

  const [name, setName] = useState("");

  return (
    <div className="playlist-section">
      <h2>Playlists</h2>

      {/* Create playlist */}
      <form
        onSubmit={() => {
          if (name.trim()) {
            createPlaylist(name);
            setName("");
          }
        }}
      >
        <input
          placeholder="New playlist name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="glass" type="submit">
          Create
        </button>
      </form>

      {/* Playlist list */}
      {playlists.map((pl) => (
        <div key={pl.id} className="playlist">
          <div className="playlist-head">
            <h4>{pl.name}</h4>

            <button className="glass" onClick={() => playPlaylist(pl.songIds)}>
              ▶ Play
            </button>

            <button
              className="glass"
              onClick={() => deletePlaylist(pl.id)}
              style={{ color: "orange" }}
            >
              Delete
            </button>
          </div>

          {/* Add song dropdown */}
          <select
            className="glass"
            onChange={(e) => addSongToPlaylist(pl.id, Number(e.target.value))}
          >
            <option value="">Add song</option>
            {songs.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>

          {/* Songs inside playlist */}
          {pl.songIds.length === 0 && (
            <p className="empty-text">No songs added</p>
          )}

          {pl.songIds.map((id) => {
            const songIndex = songs.findIndex((s) => s.id === id);
            if (songIndex === -1) return null;
            const song = songs[songIndex];

            return (
              <div key={id} className="playlist-item">
                <span
                  // onClick={() => {
                  //   const queue = pl.songIds.map((pid) =>
                  //     songs.findIndex((s) => s.id === pid)
                  //   );
                  //   playSong(queue.indexOf(songIndex), queue);
                  // }}
                >
                  🎵 {song.title}
                </span>

                <button className="glass" onClick={() => removeSongFromPlaylist(pl.id, song.id)}>
                  ❌
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Playlists;
