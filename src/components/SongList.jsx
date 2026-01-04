import { songs } from "../data/songs";
import { usePlayer } from "../context/PlayerContext";
import "../styles/player.css";

const SongList = () => {
  const { playSong } = usePlayer();

  const libraryQueue = songs.map((_, i) => i);

  return (
    <div className="songs-list">
      <h2>Songs List</h2>
      {songs.map((song, index) => (
        <div
          className="song"
          key={song.id}
          onClick={() => playSong(index, libraryQueue)}
          style={
            {
              // padding: "1rem",
              // cursor: "pointer",
              // borderBottom: "1px solid rgba(255,255,255,0.1)",
              // textTransform: "capitalize",
            }
          }
        >
          <span className="song-name">
            <img src={song.cover} alt={song.title} loading="lazy"/>
            <span>🎵 {song.title}</span>
          </span>
          <span> {song.artist}</span>
        </div>
      ))}
    </div>
  );
};

export default SongList;
