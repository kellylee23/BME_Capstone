import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  max-width: 430px;
  margin: 0 auto;
  background-color: white;
  box-sizing: border-box;
  overflow: hidden;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h2`
  font-size: 26px;
  color: rgb(0, 45, 86);
  margin-bottom: 30px;
`;

const ResultItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  background-color: #f2f4f7;
  padding: 12px;
  border-radius: 10px;
`;

const Image = styled.img`
  width: 100px;
  height: auto;
  border-radius: 8px;
  margin-right: 20px;
`;

const Prediction = styled.p`
  font-size: 18px;
  color: #333;
`;

const EmptyMessage = styled.p`
  text-align: center;
  color: #999;
`;

const Button = styled.button`
  display: block;
  margin: 30px auto 0 auto;
  padding: 12px 24px;
  border: none;
  border-radius: 30px;
  background-color: rgb(0, 45, 86);
  color: white;
  cursor: pointer;

  &:hover {
    background-color: rgba(0, 45, 86, 0.7);
  }
`;

const NailPredict = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const croppedImages = location.state?.croppedImages || [];

  const [loading, setLoading] = useState(false);
  const [bestResult, setBestResult] = useState(null);

  useEffect(() => {
    if (croppedImages.length > 0) {
      classifyAllImages();
    }
  }, [croppedImages]);

  const classifyAllImages = async () => {
    setLoading(true);
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
          prediction: { label_name: "예측 실패", probability: 0 },
          imageUrl: base64ImageUrl,
        });
      }
    }

    // probability가 가장 높은 결과 하나만 선택
    const best = results.reduce((prev, curr) => {
      const prevProb = parseFloat(prev.prediction.probability || 0);
      const currProb = parseFloat(curr.prediction.probability || 0);
      return currProb > prevProb ? curr : prev;
    });

    setBestResult(best);
    setLoading(false);
  };

  return (
    <Container>
      {loading ? (
        <>
          <ClipLoader size={60} color="rgb(0, 45, 86)" />
          <p style={{ marginTop: "20px", color: "#555" }}>
            결과를 분석하는 중 입니다...
          </p>
        </>
      ) : bestResult ? (
        <>
          <Title>분석 결과</Title>
          <ResultItem>
            <Image src={bestResult.imageUrl} alt="Best nail" />
            <Prediction>
              예측 결과: {bestResult.prediction.label_name}
              <br />
              빈혈일 확률이 {bestResult.prediction.probability} % 입니다.
            </Prediction>
          </ResultItem>
          <Button onClick={() => navigate("/")}>처음으로</Button>
        </>
      ) : (
        <>
          <EmptyMessage>결과가 없습니다.</EmptyMessage>
          <Button onClick={() => navigate("/")}>처음으로</Button>
        </>
      )}
    </Container>
  );
};

export default NailPredict;
