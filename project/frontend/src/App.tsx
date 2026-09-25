import { BrowserRouter, Routes, Route, Link } from "react-router";
import Navigation from "./components/navigation";
import Home from "./pages/home";
import List from "./pages/list";

function App() {
    return (
        <BrowserRouter>
            <Navigation />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/list" element={<List />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;