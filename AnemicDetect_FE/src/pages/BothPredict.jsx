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
  align-items: center;
  margin-bottom: 20px;
  background-color: #f2f4f7;
  padding: 12px;
  border-radius: 10px;
`;

const Image = styled.img`
  width: 150px;
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
          // 결과 합치기
          const allResults = [
            ...eyeResults.map((r) => ({ ...r, type: "eye" })),
            ...nailResults.map((r) => ({ ...r, type: "nail" })),
          ];

          // 확률이 있는 결과만 필터링
          const filtered = allResults.filter(
            (res) => res.prediction && res.prediction.probability !== undefined
          );

          // 최고 확률 결과 찾기
          const bestResult = filtered.reduce(
            (best, curr) =>
              parseFloat(curr.prediction.probability) >
              parseFloat(best.prediction.probability)
                ? curr
                : best,
            filtered[0]
          );

          return (
            <>
              <Title>
                {/* {bestResult.type === "eye"
                  ? "눈 부위 분석 결과"
                  : "손톱 부위 분석 결과"} */}
                최종 분석 결과
              </Title>
              <ResultItem>
                <Image src={bestResult.imageUrl} alt="best" />
                <Prediction>
                  예측 결과: {bestResult.prediction.label_name}
                  <br />
                  빈혈일 확률이 {bestResult.prediction.probability ?? "N/A"} %
                  입니다.
                </Prediction>
              </ResultItem>
              <ResetButton onClick={() => navigate("/")}>처음으로</ResetButton>
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
