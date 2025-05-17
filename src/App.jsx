import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./Components/Home/Home";
import Control from "./Components/Control/Control";
import Upload from "./Components/Upload/Upload";
import "bootstrap/dist/css/bootstrap.min.css";
import Database from "./Components/Control/Database/Database";
import MyNavbar from "./Components/Navbar/MyNavbar";

function App() {
  return (
    <BrowserRouter>
      <MyNavbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/control" element={<Control />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/database" element={<Database />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
