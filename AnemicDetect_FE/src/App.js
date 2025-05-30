import { Routes, Route, BrowserRouter, useLocation } from "react-router-dom";
import GlobalStyle from "./styles/Globalstyles";
import Navbar from "./components/Navbar";
import React from "react";

import Main from "./pages/Main";
import Choose from "./pages/Choose";
import CameraBoth from "./pages/CameraBoth";
import CameraEye from "./pages/CameraEye";
import CameraNail from "./pages/CameraNail";
import Capture from "./pages/Capture";
import Result from "./pages/Result";
import Upload from "./pages/Upload";
import NailPredictPage from "./pages/NailPredict";

// import Webcam from "react-webcam";
// import styled from "styled-components";

function App() {
  return (
    <BrowserRouter>
      <GlobalStyle />
      <div className="app-container">
        <Navbar />
        <Routes>
          {/* 시작페이지(메인) */}
          <Route path="/" element={<Main />} />
          {/* 유형 구분 */}
          <Route path="/choose" element={<Choose />} />
          {/* 카메라-눈 */}
          <Route path="/camera/eye" element={<CameraEye />} />
          {/* 카메라-손톱 */}
          <Route path="/camera/nail" element={<CameraNail />} />
          {/* 카메라-눈+손톱 */}
          <Route path="/camera/both" element={<CameraBoth />} />

          {/* 캡쳐화면 */}
          <Route path="/capture" element={<Capture />} />

          {/* 결과 페이지 */}
          <Route path="/result/upload" element={<Upload />} />
          <Route path="/result" element={<Result />} />
          <Route path="/result/nail" element={<NailPredictPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
