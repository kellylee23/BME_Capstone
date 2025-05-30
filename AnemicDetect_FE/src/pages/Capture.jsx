import React from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  width: 100vw;
  max-width: 430px; /* 최대 너비 제한 (예: iPhone 14 Pro Max 크기) */
  height: 100vh;
  flex-direction: column;
  align-items: center;
  background-color: white;
  padding: 20px;
  padding-top: 100px;
  padding-bottom: 80px;
  overflow-y: auto;
  box-sizing: border-box;
  margin: 0 auto; /* 가운데 정렬 (작은 화면에서는 영향 없지만, 데스크톱에서 보기 좋게) */
`;

function Capture() {
  const location = useLocation();
  const croppedImages = location.state?.croppedImages || [];

  return (
    <div>
      <h2>전처리된 손톱 이미지 결과</h2>
      {croppedImages.length === 0 ? (
        <p>이미지가 없습니다.</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {croppedImages.map((url, index) => (
            <img key={index} src={url} alt={`손톱 ${index + 1}`} width="150" />
          ))}
        </div>
      )}
    </div>
  );
}

export default Capture;
