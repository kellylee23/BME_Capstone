import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { useLocation } from "react-router-dom";
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

const EyePredict = () => {
  const location = useLocation();
  const croppedImages = location.state?.croppedImages || [];

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (croppedImages.length > 0) {
      classifyAllImages();
    }
  }, [croppedImages]);

  const classifyAllImages = async () => {
    setLoading(true);
    const newResults = [];

    for (let base64ImageUrl of croppedImages) {
      try {
        const blob = await (await fetch(base64ImageUrl)).blob();
        const file = new File([blob], "conj.jpg", { type: "image/jpeg" });
        const formData = new FormData();
        formData.append("image", file);

        const res = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/conj-classify/`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        newResults.push({
          prediction: res.data.prediction,
          imageUrl: base64ImageUrl,
        });
      } catch (err) {
        console.error("예측 실패:", err);
        newResults.push({
          prediction: { label_name: "예측 실패" },
          imageUrl: base64ImageUrl,
        });
      }
    }

    setResults(newResults);
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
      ) : results.length > 0 ? (
        <>
          <Title>분석 결과</Title>
          {results.map((res, idx) => (
            <ResultItem key={idx}>
              <Image src={res.imageUrl} alt={`conj-${idx}`} />
              <Prediction>예측 결과: {res.prediction.label_name}</Prediction>
            </ResultItem>
          ))}
        </>
      ) : (
        <EmptyMessage>결과가 없습니다.</EmptyMessage>
      )}
    </Container>
  );
};

export default EyePredict;
