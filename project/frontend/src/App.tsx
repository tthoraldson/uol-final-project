import { BrowserRouter, Routes, Route, Link } from "react-router";
import Navigation from "./components/navigation";
import Home from "./pages/home";

function App() {
  return (
    <BrowserRouter>
      <Navigation />

      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
