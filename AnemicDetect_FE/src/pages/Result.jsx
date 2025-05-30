// Result.jsx
import React, { useEffect, useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
  font-family: "Arial", sans-serif;
`;

const Title = styled.h2`
  font-size: 26px;
  color: rgb(0, 45, 86);
  margin-bottom: 30px;
  text-align: center;
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

const Result = () => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("nailResults");
    if (stored) {
      setResults(JSON.parse(stored));
    }
  }, []);

  return (
    <Container>
      <Title>분석 결과</Title>
      {results.length === 0 ? (
        <EmptyMessage>결과가 없습니다.</EmptyMessage>
      ) : (
        results.map((res, idx) => (
          <ResultItem key={idx}>
            <Image src={res.imageUrl} alt={`nail-${idx}`} />
            <Prediction>예측 결과: {res.prediction.label_name}</Prediction>
          </ResultItem>
        ))
      )}
    </Container>
  );
};

export default Result;
