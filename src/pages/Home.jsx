import SongList from "../components/SongList";
import Playlists from "../components/Playlists";
import Logo from "../assets/Logos/Logo.png";

const Home = () => {
  return (
    <div className="container">
      <header>
        <div className="logo">
          <img src={Logo} alt="Melody" loading="lazy"/>
        </div>
        <div className="title">
          <h1>Melody</h1>
          <p>Your personal music space</p>
        </div>
      </header>
      <main className="main">
        <Playlists />
        <SongList />
      </main>
    </div>
  );
};

export default Home;
