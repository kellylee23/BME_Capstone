import React, { useRef, useState, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import styled from "styled-components";
import axios from "axios";
import { BsFillCameraFill } from "react-icons/bs";
import { GrPowerCycle } from "react-icons/gr";
import { useNavigate } from "react-router-dom";

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
`;
const HeaderBox = styled.div`
  flex: 0 0 18%;
  background-color: rgb(0, 45, 86);
  display: flex;
  align-items: flex-end;
  padding: 10px 20px;
  color: white;
`;
const FooterBox = styled.div`
  flex: 0 0 auto;
  padding: 80px 0;
  background-color: rgb(0, 45, 86);
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
`;

const Title = styled.div`
  position: absolute;
  width: 68px;
  height: 19px;
  left: 50px;
  top: 100px;
  font-weight: 400;
  font-size: 16px;
  line-height: 19px;
  color: #ffffff;
`;

const CaptureBox = styled.div`
  flex: 1; /* 남은 영역을 다 채움 */
  margin: 10px 20px;
  border: 1px solid rgb(0, 45, 86);
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const StyledWebcam = styled(Webcam)`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CameraIcon = styled(BsFillCameraFill)`
  position: absolute;
  width: 45px;
  height: 45px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgb(218, 218, 211);
  cursor: pointer;
`;

const SideCircle = styled.div`
  position: absolute;
  width: 65px;
  height: 65px;
  left: 260px;
  top: 630px;
  background: rgba(218, 218, 211, 0.3);
  border-radius: 50%;
`;

const BottomCircleOuter = styled.div`
  position: absolute;
  width: 80px;
  height: 80px;
  left: 150px;
  top: 623px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
`;

const BottomCircleInner = styled.div`
  position: absolute;
  width: 65px;
  height: 65px;
  left: 157px;
  top: 630px;
  background: rgba(218, 218, 211, 0.3);
  border-radius: 50%;
`;

const Change = styled(GrPowerCycle)`
  position: absolute;
  width: 40px;
  height: 40px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgb(218, 218, 211);
  cursor: pointer;
`;

const CapturedImageFull = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RetakeButton = styled.button`
  position: absolute;
  bottom: 20px;
  padding: 8px 16px;
  background-color: rgb(0, 45, 86);
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-size: 14px;
  z-index: 1;

  &:hover {
    background-color: rgba(0, 45, 86, 0.5);
  }
`;

const PermissionText = styled.div`
  width: 100%;
  height: 100%;
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const ResultBox = styled.div`
  position: absolute;
  width: 120px;
  height: 40px;
  left: 270px;
  top: 710px;
  background-color: white;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background-color: rgba(0, 45, 86, 0.8);
  }
`;

const GuideFrame = styled.div`
  position: absolute;
  width: 220px;
  height: 160px;
  border: 3px dashed rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none; /* 클릭 방지 */
  z-index: 1;
`;

function CameraNail() {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [croppedImages, setCroppedImages] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { exact: facingMode } } })
      .then(() => setHasPermission(true))
      .catch(() => setHasPermission(false));
  }, [facingMode]);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImgSrc(imageSrc);
      uploadToBackend(imageSrc);
    }
  }, [webcamRef]);

  const uploadToBackend = async (base64Image) => {
    try {
      const blob = await (await fetch(base64Image)).blob();
      const file = new File([blob], "captured.jpg", { type: "image/jpeg" });
      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/nail-preprocess/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("전처리 결과:", response.data);
      setCroppedImages(response.data.cropped_images);
      // 예: response.data.cropped_images => [url1, url2, ...]
      // 필요한 경우 상태로 저장해서 결과 보기 버튼 등에서 사용
    } catch (error) {
      console.error("이미지 업로드 오류:", error);
    }
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };
  console.log("전처리 결과 croppedImages:", croppedImages);
  return (
    <Container>
      <HeaderBox />
      <Title>CAMERA</Title>
      <CaptureBox>
        {hasPermission === false ? (
          <PermissionText>
            카메라 접근 권한이 거부되었습니다.
            <br />
            브라우저 설정에서 권한을 허용해주세요.
          </PermissionText>
        ) : hasPermission === null ? (
          <PermissionText>카메라 권한을 요청 중입니다...</PermissionText>
        ) : imgSrc ? (
          <>
            <CapturedImageFull src={imgSrc} alt="Captured" />
            <RetakeButton onClick={() => setImgSrc(null)}>
              다시 찍기
            </RetakeButton>
          </>
        ) : (
          <>
            <StyledWebcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: { exact: facingMode } }}
            />
            <GuideFrame />
          </>
        )}
      </CaptureBox>

      <FooterBox />
      <BottomCircleOuter />
      <BottomCircleInner onClick={capture}>
        <CameraIcon />
      </BottomCircleInner>
      <SideCircle>
        <Change onClick={toggleFacingMode} />
      </SideCircle>
      <ResultBox
        onClick={() => {
          navigate("/result/nail", { state: { croppedImages } });
        }}
      >
        결과보기
      </ResultBox>
    </Container>
  );
}

export default CameraNail;
