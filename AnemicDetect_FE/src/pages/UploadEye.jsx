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
  gap: 20px;
`;

const GuideText = styled.p`
  font-size: 14px;
  color: #555;
  margin: 10px 0 20px 0;
  text-align: center;
  line-height: 1.4;
`;

const Title = styled.h2`
  font-size: 20px;
  color: rgb(0, 45, 86);
  margin-bottom: 10px;
`;

const UploadLabel = styled.label`
  background-color: rgb(0, 45, 86);
  color: white;
  padding: 12px 24px;
  border-radius: 30px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: rgba(0, 45, 86, 0.7);
  }
`;

const UploadInput = styled.input`
  display: none;
`;

const PreviewImage = styled.img`
  width: 100%;
  border-radius: 16px;
  border: 2px solid rgba(0, 45, 86, 0.2);
`;

const RetakeButton = styled.button`
  padding: 8px 20px;
  border-radius: 30px;
  border: none;
  background-color: rgb(0, 45, 86);
  color: white;
  cursor: pointer;
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
  background-color: white;
  color: rgb(0, 45, 86);
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid rgb(0, 45, 86);

  &:hover {
    background-color: rgba(255, 255, 255, 0.8);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

function UploadEye() {
  const [imgSrc, setImgSrc] = useState(null);
  const [croppedImages, setCroppedImages] = useState([]);
  const navigate = useNavigate();

  const handleImageUpload = async (event) => {
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
        `${process.env.REACT_APP_API_URL}/api/conj-preprocess/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setCroppedImages(response.data.cropped_images);
    } catch (error) {
      console.error("이미지 업로드 오류:", error);
    }
  };

  return (
    <Container>
      <Card>
        <Title>결막 이미지 업로드</Title>
        <GuideText>
          결막 사진을 선명하게 촬영해주세요. <br />
          촬영 시, 눈은 위쪽을 응시해주세요. <br />
          최대 5MB까지 업로드 가능합니다.
        </GuideText>
        {imgSrc ? (
          <>
            <PreviewImage src={imgSrc} alt="Preview" />
            <RetakeButton onClick={() => setImgSrc(null)}>
              다시 선택
            </RetakeButton>
          </>
        ) : (
          <>
            <UploadInput
              type="file"
              id="upload"
              accept="image/*"
              onChange={handleImageUpload}
            />
            <UploadLabel htmlFor="upload">이미지 선택하기</UploadLabel>
          </>
        )}
        <ResultButton
          onClick={() => navigate("/result/eye", { state: { croppedImages } })}
        >
          결과 보기
        </ResultButton>
      </Card>
    </Container>
  );
}

export default UploadEye;
