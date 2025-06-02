import React, { useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background-color: #edf3f8;
  font-family: "Noto Sans", sans-serif;
`;

const Card = styled.div`
  width: 100%;
  max-width: 400px;
  background-color: white;
  border-radius: 24px;
  padding: 30px 20px;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`;

const Title = styled.h2`
  font-size: 18px;
  color: rgb(0, 45, 86);
  margin: 8px 0;
  text-align: center;
`;

const UploadLabel = styled.label`
  background-color: rgb(0, 45, 86);
  color: white;
  padding: 10px 20px;
  border-radius: 30px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;

  &:hover {
    background-color: rgba(0, 45, 86, 0.7);
  }
`;

const UploadInput = styled.input`
  display: none;
`;

const PreviewImage = styled.img`
  max-width: 240px;
  width: 100%;
  border-radius: 16px;
  border: 2px solid rgba(0, 45, 86, 0.2);
`;

const RetakeButton = styled.button`
  padding: 8px 16px;
  border-radius: 30px;
  border: none;
  background-color: rgb(0, 45, 86);
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;

  &:hover {
    background-color: rgba(0, 45, 86, 0.5);
  }
`;

const ResultButton = styled.button`
  margin-top: 10px;
  padding: 12px 24px;
  border-radius: 30px;
  border: none;
  background-color: ${({ disabled }) => (disabled ? "#ccc" : "white")};
  color: ${({ disabled }) => (disabled ? "#666" : "rgb(0, 45, 86)")};
  font-weight: bold;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: all 0.3s ease;
  border: 2px solid rgb(0, 45, 86);

  &:hover {
    background-color: ${({ disabled }) =>
      disabled ? "#ccc" : "rgba(255, 255, 255, 0.8)"};
    transform: ${({ disabled }) => (disabled ? "none" : "translateY(-2px)")};
    box-shadow: ${({ disabled }) =>
      disabled ? "none" : "0 4px 12px rgba(0, 0, 0, 0.1)"};
  }
`;

function UploadBoth() {
  const [eyeImgSrc, setEyeImgSrc] = useState(null);
  const [nailImgSrc, setNailImgSrc] = useState(null);
  const [eyeCrops, setEyeCrops] = useState([]);
  const [nailCrops, setNailCrops] = useState([]);
  const navigate = useNavigate();

  const handleUpload = async (event, setImgSrc, setCrops, apiPath) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImgSrc(reader.result);
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}${apiPath}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setCrops(response.data.cropped_images);
    } catch (error) {
      console.error("이미지 업로드 오류:", error);
    }
  };

  const canProceed = eyeCrops.length > 0 && nailCrops.length > 0;

  return (
    <Container>
      <Card>
        <Title>결막 이미지 업로드</Title>
        {eyeImgSrc ? (
          <>
            <PreviewImage src={eyeImgSrc} alt="결막 미리보기" />
            <RetakeButton onClick={() => setEyeImgSrc(null)}>
              다시 선택
            </RetakeButton>
          </>
        ) : (
          <>
            <UploadInput
              type="file"
              id="eyeUpload"
              accept="image/*"
              onChange={(e) =>
                handleUpload(
                  e,
                  setEyeImgSrc,
                  setEyeCrops,
                  "/api/conj-preprocess/"
                )
              }
            />
            <UploadLabel htmlFor="eyeUpload">이미지 선택하기</UploadLabel>
          </>
        )}

        <Title>손톱 이미지 업로드</Title>
        {nailImgSrc ? (
          <>
            <PreviewImage src={nailImgSrc} alt="손톱 미리보기" />
            <RetakeButton onClick={() => setNailImgSrc(null)}>
              다시 선택
            </RetakeButton>
          </>
        ) : (
          <>
            <UploadInput
              type="file"
              id="nailUpload"
              accept="image/*"
              onChange={(e) =>
                handleUpload(
                  e,
                  setNailImgSrc,
                  setNailCrops,
                  "/api/nail-preprocess/"
                )
              }
            />
            <UploadLabel htmlFor="nailUpload">이미지 선택하기</UploadLabel>
          </>
        )}

        <ResultButton
          disabled={!canProceed}
          onClick={() =>
            navigate("/result/both", {
              state: { eyeCrops, nailCrops },
            })
          }
        >
          결과 보기
        </ResultButton>
      </Card>
    </Container>
  );
}

export default UploadBoth;
