import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./Components/Home/Home";
import Playlist from "./Components/Control/Playlist/Playlist";
import Upload from "./Components/Upload/Upload";
import "bootstrap/dist/css/bootstrap.min.css";
import Database from "./Components/Control/Database/Database";
import MyNavbar from "./Components/Navbar/MyNavbar";
import { SettingsProvider } from "./Components/Settings/SettingsContext";

function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <MyNavbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/playlist" element={<Playlist />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/database" element={<Database />} />
        </Routes>
      </BrowserRouter>
    </SettingsProvider>
  );
}

export default App;
