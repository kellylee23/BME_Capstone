import React, { useState } from "react";
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
  overflow: auto;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
`;

const Title = styled.h2`
  font-size: 26px;
  color: rgb(0, 45, 86);
  margin: 40px 0 30px;
`;

const ImageGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-bottom: 20px;
`;

const PreviewImage = styled.img`
  width: 150px;
  height: auto;
  border-radius: 8px;
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
  padding: 10px 20px;
  font-size: 16px;
  background-color: rgb(0, 45, 86);
  color: white;
  border: none;
  border-radius: 8px;
  margin: 20px 0;
  cursor: pointer;

  &:hover {
    background-color: rgb(0, 30, 60);
  }
`;

const LoaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ResetButton = styled.button`
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
const BothPredictPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const eyeImages = location.state?.eyeCrops || [];
  const nailImages = location.state?.nailCrops || [];

  const [loading, setLoading] = useState(false);
  const [eyeResults, setEyeResults] = useState([]);
  const [nailResults, setNailResults] = useState([]);
  const [analysisStarted, setAnalysisStarted] = useState(false);

  const classifyImages = async (images, apiEndpoint, fileName) => {
    const results = [];
    for (let base64ImageUrl of images) {
      try {
        const blob = await (await fetch(base64ImageUrl)).blob();
        const file = new File([blob], fileName, { type: "image/jpeg" });
        const formData = new FormData();
        formData.append("image", file);

        const res = await axios.post(
          `${process.env.REACT_APP_API_URL}${apiEndpoint}`,
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
          prediction: { label_name: "예측 실패", probability: null },
          imageUrl: base64ImageUrl,
        });
      }
    }
    return results;
  };

  const classifyAllImages = async () => {
    setLoading(true);
    setAnalysisStarted(true);

    const [eyeRes, nailRes] = await Promise.all([
      classifyImages(eyeImages, "/api/conj-classify/", "conj.jpg"),
      classifyImages(nailImages, "/api/nail-classify/", "nail.jpg"),
    ]);

    setEyeResults(eyeRes);
    setNailResults(nailRes);
    setLoading(false);
  };

  return (
    <Container>
      {!analysisStarted ? (
        <>
          <Title>전처리 결과</Title>

          {eyeImages.length > 0 && (
            <>
              <h3>눈 부위</h3>
              <ImageGrid>
                {eyeImages.map((img, idx) => (
                  <PreviewImage
                    key={`eye-${idx}`}
                    src={img}
                    alt={`eye-${idx}`}
                  />
                ))}
              </ImageGrid>
            </>
          )}

          {nailImages.length > 0 && (
            <>
              <h3>손톱 부위</h3>
              <ImageGrid>
                {nailImages.map((img, idx) => (
                  <PreviewImage
                    key={`nail-${idx}`}
                    src={img}
                    alt={`nail-${idx}`}
                  />
                ))}
              </ImageGrid>
            </>
          )}

          <Button onClick={classifyAllImages}>분석 시작</Button>
        </>
      ) : loading ? (
        <LoaderWrapper>
          <ClipLoader size={60} color="rgb(0, 45, 86)" />
          <p style={{ marginTop: "20px", color: "#555" }}>
            결과를 분석하는 중 입니다...
          </p>
        </LoaderWrapper>
      ) : eyeResults.length > 0 || nailResults.length > 0 ? (
        (() => {
          const allResults = [
            ...eyeResults.map((r) => ({ ...r, type: "eye" })),
            ...nailResults.map((r) => ({ ...r, type: "nail" })),
          ];

          const filtered = allResults.filter(
            (res) => res.prediction && res.prediction.probability !== undefined
          );

          const MODEL_WEIGHTS = {
            eye: 0.963,
            nail: 0.893,
          };

          const eyeProbs = filtered
            .filter((r) => r.type === "eye")
            .map((r) => parseFloat(r.prediction.probability));

          const nailProbs = filtered
            .filter((r) => r.type === "nail")
            .map((r) => parseFloat(r.prediction.probability));

          const avgNailProb = nailProbs.length
            ? nailProbs.reduce((sum, p) => sum + p, 0) / nailProbs.length
            : null;

          const avgEyeProb = eyeProbs.length
            ? eyeProbs.reduce((sum, p) => sum + p, 0) / eyeProbs.length
            : null;

          const useNail = avgNailProb !== null;
          const useEye = avgEyeProb !== null;

          let finalProb = null;

          if (useNail && useEye) {
            finalProb =
              (MODEL_WEIGHTS.nail * avgNailProb +
                MODEL_WEIGHTS.eye * avgEyeProb) /
              (MODEL_WEIGHTS.nail + MODEL_WEIGHTS.eye);
          } else if (useNail) {
            finalProb = avgNailProb;
          } else if (useEye) {
            finalProb = avgEyeProb;
          }

          const finalLabel = finalProb >= 0.5 ? "Anemic" : "Non-Anemic";

          return (
            <>
              <Title>분석 결과</Title>
              <ResultItem>
                <Prediction>
                  최종 예측: {finalLabel}
                  <br />
                  가중 평균 확률: {finalProb.toFixed(2)}%
                </Prediction>
                <Prediction className="explanation">
                  {useNail && useEye
                    ? "눈과 손톱 부위 모두 분석되었기 때문에, 각 모델의 정확도를 고려한 가중치 기반 예측 결과입니다."
                    : useNail
                    ? "손톱 이미지만 분석되어 해당 결과를 기반으로 예측되었습니다."
                    : "눈 이미지만 분석되어 해당 결과를 기반으로 예측되었습니다."}
                </Prediction>
              </ResultItem>
              <Button onClick={() => navigate("/")}>처음으로</Button>
            </>
          );
        })()
      ) : (
        <>
          <EmptyMessage>결과가 없습니다.</EmptyMessage>
          <ResetButton onClick={() => navigate("/")}>처음으로</ResetButton>
        </>
      )}
    </Container>
  );
};

export default BothPredictPage;
