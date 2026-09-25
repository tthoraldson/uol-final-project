import AudioPlayer from "react-h5-audio-player";
import Navigation from "../components/navigation";
import Music from "../components/music";
import Container from "react-bootstrap/esm/Container";

function Home() {
  return (
    <>
      <title>Sight Reader Pro - Home</title>
      <Container>
        <Music />
      </Container>
    </>
  );
}

export default Home;
