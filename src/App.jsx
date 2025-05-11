import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./Components/Home/Home";
import Control from "./Components/Control/Control";
import Upload from "./Components/Upload/Upload";
import "bootstrap/dist/css/bootstrap.min.css";
import StartLive from "./Components/Home/StartLive";
import ExitLive from "./Components/Home/ExitLive";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/control" element={<Control />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/start-live" element={<StartLive />} />
        <Route path="/exit-live" element={<ExitLive />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
