// src/pages/NailPreprocessResultPage.jsx
import React from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";

const Container = styled.div`
  padding: 20px;
  max-width: 430px;
  margin: auto;
  background-color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h2`
  text-align: center;
  color: rgb(0, 45, 86);
  margin-bottom: 20px;
`;

const ImageGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
`;

const Image = styled.img`
  width: 150px;
  height: auto;
  border-radius: 8px;
  border: 1px solid #ccc;
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

const NailPreprocessResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const croppedImages = location.state?.croppedImages || [];

  return (
    <Container>
      <Title>전처리 결과</Title>
      <ImageGrid>
        {croppedImages.map((img, idx) => (
          <Image key={idx} src={img} alt={`cropped-${idx}`} />
        ))}
      </ImageGrid>
      <Button
        onClick={() => navigate("/result/nail", { state: { croppedImages } })}
      >
        분석 시작
      </Button>
    </Container>
  );
};

export default NailPreprocessResultPage;
