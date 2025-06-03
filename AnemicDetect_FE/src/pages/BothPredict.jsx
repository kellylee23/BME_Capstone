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
  overflow: auto;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
`;

const Title = styled.h2`
  font-size: 26px;
  color: rgb(0, 45, 86);
  margin-bottom: 30px;
  margin-top: 40px;
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

const BothPredictPage = () => {
  const location = useLocation();
  console.log("location.state:", location.state);

  const eyeImages = location.state?.eyeCrops || [];
  const nailImages = location.state?.nailCrops || [];

  const [loading, setLoading] = useState(false);
  const [eyeResults, setEyeResults] = useState([]);
  const [nailResults, setNailResults] = useState([]);
  useEffect(() => {
    console.log("eyeImages:", eyeImages);
    console.log("nailImages:", nailImages);
    if (eyeImages.length > 0 || nailImages.length > 0) {
      classifyAllImages();
    }
  }, [eyeImages, nailImages]);

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
          prediction: { label_name: "예측 실패" },
          imageUrl: base64ImageUrl,
        });
      }
    }
    return results;
  };

  const classifyAllImages = async () => {
    setLoading(true);

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
      {loading ? (
        <>
          <ClipLoader size={60} color="rgb(0, 45, 86)" />
          <p style={{ marginTop: "20px", color: "#555" }}>
            결과를 분석하는 중 입니다...
          </p>
        </>
      ) : eyeResults.length > 0 || nailResults.length > 0 ? (
        <>
          {eyeResults.length > 0 && (
            <>
              <Title>눈 부위 분석 결과</Title>
              {eyeResults.map((res, idx) => (
                <ResultItem key={`eye-${idx}`}>
                  <Image src={res.imageUrl} alt={`eye-${idx}`} />
                  <Prediction>
                    예측 결과: {res.prediction.label_name}
                  </Prediction>
                </ResultItem>
              ))}
            </>
          )}

          {nailResults.length > 0 && (
            <>
              <Title>손톱 부위 분석 결과</Title>
              {nailResults.map((res, idx) => (
                <ResultItem key={`nail-${idx}`}>
                  <Image src={res.imageUrl} alt={`nail-${idx}`} />
                  <Prediction>
                    예측 결과: {res.prediction.label_name}
                  </Prediction>
                </ResultItem>
              ))}
            </>
          )}
        </>
      ) : (
        <EmptyMessage>결과가 없습니다.</EmptyMessage>
      )}
    </Container>
  );
};

export default BothPredictPage;
