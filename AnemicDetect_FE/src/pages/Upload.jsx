// Upload.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";

const Container = styled.div`
  max-width: 430px;
  margin: 0 auto;
  padding: 40px 20px;
  text-align: center;
  font-family: "Arial", sans-serif;
`;

const Title = styled.h2`
  font-size: 24px;
  color: rgb(0, 45, 86);
  margin-bottom: 20px;
`;

const PredictButton = styled.button`
  background-color: rgb(0, 45, 86);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 30px;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    background-color: rgba(0, 45, 86, 0.8);
  }

  &:disabled {
    background-color: #aaa;
    cursor: not-allowed;
  }
`;

const Upload = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const croppedImages = location.state?.croppedImages || [];

  const classifyAllImages = async () => {
    if (croppedImages.length === 0) {
      alert("전처리된 이미지가 없습니다.");
      return;
    }

    setLoading(true); // 업로드 중 상태 시작
    const results = [];

    for (let base64ImageUrl of croppedImages) {
      try {
        const blob = await (await fetch(base64ImageUrl)).blob();
        const file = new File([blob], "nail.jpg", { type: "image/jpeg" });
        const formData = new FormData();
        formData.append("image", file);

        const res = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/nail-classify/`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        results.push({
          prediction: res.data.prediction,
          imageUrl: base64ImageUrl,
        });
      } catch (err) {
        console.error("예측 실패:", err);
        results.push({
          prediction: { label_name: "예측 실패" },
          imageUrl: base64ImageUrl,
        });
      }
    }

    localStorage.setItem("nailResults", JSON.stringify(results));
    navigate("/result");
  };

  useEffect(() => {
    if (loading) {
      classifyAllImages();
    }
    // eslint-disable-next-line
  }, [loading]);

  return (
    <Container>
      <Title>손톱 예측 결과 보기</Title>
      <PredictButton onClick={() => setLoading(true)} disabled={loading}>
        {loading ? "업로드 중..." : "결과 보기"}
      </PredictButton>
    </Container>
  );
};

export default Upload;
