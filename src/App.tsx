import { Route, Routes } from "react-router-dom";
import "./App.css";

import VideoCall from "./components/videoCall";
import HomePage from "./components/HomePage";

function App() {
  return (
    <Routes>
      <Route path="/videocall" element={<VideoCall />} />
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
}

export default App;
