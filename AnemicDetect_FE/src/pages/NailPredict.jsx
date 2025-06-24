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

const NailPredict = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const croppedImages = location.state?.croppedImages || [];

  const [loading, setLoading] = useState(false);
  const [best, setBest] = useState(null);
  const [avgProb, setAvgProb] = useState(0); // 변수명 간단히
  const [finalLabel, setFinalLabel] = useState(null);

  useEffect(() => {
    if (croppedImages.length > 0) {
      classifyAllImages();
    }
  }, [croppedImages]);

  const sigmoidLikeScaling = (raw_prob, threshold = 0.7602, sharpness = 10) => {
    const x = (raw_prob - threshold) * sharpness;
    return 1 / (1 + Math.exp(-x));
  };

  const classifyAllImages = async () => {
    setLoading(true);
    const results = [];

    const uniqueImages = Array.from(new Set(croppedImages));

    for (let base64ImageUrl of uniqueImages) {
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
          prediction: {
            ...res.data.prediction,
            gradcam_image: res.data.gradcam_image || null,
          },
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

    // ✅ 1. 개별 보정된 확률 계산
    const calibratedProbs = results.map((r) =>
      sigmoidLikeScaling(parseFloat(r.prediction.probability || 0))
    );

    // ✅ 2. 보정된 확률 평균 계산
    const avg = calibratedProbs.length
      ? calibratedProbs.reduce((sum, p) => sum + p, 0) / calibratedProbs.length
      : 0;

    // ✅ 3. 가장 확률 높은 결과(원본 확률 기준)는 그대로 사용
    const best = results.reduce((prev, curr) => {
      const prevProb = parseFloat(prev.prediction.probability || 0);
      const currProb = parseFloat(curr.prediction.probability || 0);
      return currProb > prevProb ? curr : prev;
    });

    best.prob = parseFloat(best.prediction.probability || 0); // 원본 확률 기록

    // ✅ 4. 상태 업데이트
    setBest(best);
    setAvgProb(avg); // 평균 보정된 확률
    setFinalLabel(best.prediction.label_name);
    setLoading(false);
  };
  // ✅ 이게 실제로 화면에 보이는 JSX
  return (
    <Container>
      {loading ? (
        <>
          <ClipLoader size={60} color="rgb(0, 45, 86)" />
          <p style={{ marginTop: "20px", color: "#555" }}>
            결과를 분석하는 중 입니다...
          </p>
        </>
      ) : best ? (
        <>
          <Title>분석 결과</Title>
          <ResultItem>
            <Prediction>
              예측 결과: {best.prediction.label_name}
              <br />
              빈혈일 확률이 {avgProb.toFixed(4)}% 입니다.
              <br />
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
      <GuideText>
        이 시스템은 의료 전문 시스템이 아니므로, <br /> 위 정보는 참고 자료로
        활용하시기 바랍니다. <br /> 반드시 전문의와 상담하여 정확한 진단과
        <br />
        치료를 받으시길 바랍니다.
      </GuideText>
    </Container>
  );
};

export default NailPredict;
