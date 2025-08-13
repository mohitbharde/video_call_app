import { Route, Routes } from "react-router-dom";
import "./App.css";

import VideoCall from "./components/videoCall";
import Home from "./components/HomePage";

function App() {
  return (
    <Routes>
      <Route path="/videocall" element={<VideoCall />} />
      <Route path="/" element={<Home />} />
    </Routes>
  );
}

export default App;
