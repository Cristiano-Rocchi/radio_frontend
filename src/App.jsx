import "./App.css";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Home from "./Components/Home/Home";
import Playlist from "./Components/Control/Playlist/Playlist";
import Upload from "./Components/Upload/Upload";
import "bootstrap/dist/css/bootstrap.min.css";
import Database from "./Components/Control/Database/Database";
import MyNavbar from "./Components/Navbar/MyNavbar";
import { SettingsProvider } from "./Components/Settings/SettingsContext";
import Radio from "./Components/Radio/Radio";

function AppWrapper() {
  const location = useLocation();

  return (
    <>
      {location.pathname !== "/" && <MyNavbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/playlist" element={<Playlist />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/database" element={<Database />} />
        <Route path="/radio" element={<Radio />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <AppWrapper />
      </BrowserRouter>
    </SettingsProvider>
  );
}

export default App;
