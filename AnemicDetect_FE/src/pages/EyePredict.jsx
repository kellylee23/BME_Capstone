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
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, #f0f4ff, #d9e4ff);
  padding: 20px 24px;
  margin-bottom: 30px;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 45, 86, 0.15);
  max-width: 360px;
  width: 90%;
`;

const Image = styled.img`
  width: 160px;
  height: auto;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  object-fit: cover;
`;

const Prediction = styled.p`
  font-size: 18px;
  color: #1a1a1a;
  text-align: center;
  font-weight: 600;

  &.explanation {
    font-size: 14px;
    color: #555a6e;
    font-weight: 400;
    margin-top: 12px;
    line-height: 1.4;
  }
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

const GuideText = styled.p`
  font-size: 14px;
  color: #555;
  margin: 80px 0 20px 0;
  text-align: center;
  line-height: 1.4;
`;

const EyePredict = () => {
  const location = useLocation();
  const navigate = useNavigate();
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
          {results.map((res, index) => (
            <ResultItem key={index}>
              {res.prediction.label_name === "Anemic" &&
              res.prediction.gradcam_image ? (
                <>
                  <Image
                    src={res.prediction.gradcam_image}
                    alt="Grad-CAM result"
                  />
                  <Prediction>
                    예측 결과: {res.prediction.label_name}
                    <br />
                    빈혈일 확률이 {res.prediction.probability} % 입니다.
                  </Prediction>
                  <Prediction className="explanation">
                    AI가 예측할 때 집중한 부위를 시각화한 이미지입니다. 빨간색에
                    가까운 영역일수록 AI가 중요하게 판단한 부위입니다. 이
                    시각화를 통해 AI가 어떤 근거로 '빈혈'로 판단했는지 확인할 수
                    있습니다.
                  </Prediction>
                </>
              ) : (
                <>
                  <Image src={res.imageUrl} alt="Original nail" />
                  <Prediction>
                    예측 결과: {res.prediction.label_name}
                    <br />
                    빈혈일 확률이 {res.prediction.probability} % 입니다.
                  </Prediction>
                </>
              )}
            </ResultItem>
          ))}
          <Button onClick={() => navigate("/")}>처음으로</Button>
          <GuideText>
            이 시스템은 의료 전문 시스템이 아니므로, <br /> 위 정보는 참고
            자료로 활용하시기 바랍니다. <br /> 반드시 전문의와 상담하여 정확한
            진단과
            <br />
            치료를 받으시길 바랍니다.
          </GuideText>
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

export default EyePredict;
