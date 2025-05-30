import React, { useRef, useState, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import styled from "styled-components";
import { BsFillCameraFill } from "react-icons/bs";
import { GrPowerCycle } from "react-icons/gr";
import axios from "axios";

// 전체 화면 컨테이너
const Container = styled.div`
  display: flex;
  width: 391px;
  height: 100%;
  flex-direction: column;
  align-items: center;
  background-color: white;
  padding: 20px;
  padding-top: 100px;
  padding-bottom: 80px;
  overflow-y: auto;
  box-sizing: border-box; /* padding 포함한 높이 계산 */
`;

const HeaderBox = styled.div`
  position: absolute;
  width: 391px;
  height: 144px;
  left: 0px;
  top: 0px;
  background-color: rgb(0, 45, 86);
`;

const FooterBox = styled.div`
  position: absolute;
  width: 391px;
  height: 174px;
  left: 0px;
  bottom: 0px;
  background-color: rgb(0, 45, 86);
`;

// 상단 텍스트
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

// 캡처 영역 박스
const CaptureBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  width: 351px;
  height: 418px;
  top: 155px;
  border: 1px solid rgb(0, 45, 86);
  border-radius: 20px;
  overflow: hidden;
`;

// 카메라 컴포넌트 감싸는 div
const StyledWebcam = styled(Webcam)`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

// 카메라 아이콘
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

// 하단 캡쳐 버튼
const SideCircle = styled.div`
  position: absolute;
  width: 65px;
  height: 65px;
  left: 260px;
  top: 650px;
  background: rgba(218, 218, 211, 0.3);
  border-radius: 50%;
`;

const BottomCircleOuter = styled.div`
  position: absolute;
  width: 80px;
  height: 80px;
  left: 150px;
  top: 643px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
`;

const BottomCircleInner = styled.div`
  position: absolute;
  width: 65px;
  height: 65px;
  left: 157px;
  top: 650px;
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

const GuideOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;

  &::before {
    content: "";
    position: absolute;
    width: 60%;
    height: 60%;
    top: 20%;
    left: 20%;
    border: 2px dashed #00ff00; // 초록색 점선
    border-radius: ${({ $isActive }) => ($isActive ? "10px" : "100px")};
    box-sizing: border-box;
  }
`;
const TypeButtonWrapper = styled.div`
  position: absolute;
  margin-top: 500px;
  display: flex;
  flex-direction: row;
  gap: 30px;
  justify-content: center;
`;

const TypeButton = styled.button`
  width: 85px;
  height: 32px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-family: "noto sans", sans-serif;
  font-size: 16px;
  font-weight: ${({ $isActive }) => ($isActive ? 600 : 400)};
  background-color: ${({ $isActive }) =>
    $isActive ? "rgba(218, 218, 211, 0.6)" : "transparent"};
  border: none;
  cursor: pointer;
  transition: 0.3s;
`;
// const NavButton = styled.button`
//   position: absolute;
//   width: 80px;
//   height: 30px;
//   margin-top: 625px;
//   margin-left: 250px;
//   background-color: orange;
// `;
function Camera() {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [activeType, setActiveType] = useState("nail");
  const [results, setResults] = useState([]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { facingMode } } })
      .then(() => setHasPermission(true))
      .catch(() => setHasPermission(false));
  }, [facingMode]);

  const capture = useCallback(() => {
    console.log(webcamRef.current);
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      console.error("❌ 캡처된 이미지가 없습니다.");
      return;
    }

    setImgSrc(imageSrc);

    // base64를 Blob으로 변환
    const byteString = atob(imageSrc.split(",")[1]);
    const mimeString = imageSrc.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });

    const formData = new FormData();
    formData.append("image", blob, "capture.jpg");

    axios
      .post(process.env.REACT_APP_API_URL, formData)
      .then((response) => {
        setResults(response.data.images);
      })
      .catch((err) => {
        console.error("업로드 실패", err);
      });
  }, [webcamRef]);

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

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
              videoConstraints={{ facingMode: { facingMode } }}
            />
            <GuideOverlay $isActive={activeType === "nail"} />
          </>
        )}
      </CaptureBox>

      <FooterBox />
      <TypeButtonWrapper>
        <TypeButton
          $isActive={activeType === "nail"}
          onClick={() => {
            setActiveType("nail");
            setTimeout(() => capture(), 300);
          }}
        >
          손가락사진
        </TypeButton>
      </TypeButtonWrapper>
      <BottomCircleOuter />
      <BottomCircleInner onClick={capture}>
        <CameraIcon />
      </BottomCircleInner>
      <SideCircle>
        <Change onClick={toggleFacingMode} />
      </SideCircle>
      {/* <NavButton>결과보기</NavButton> */}
    </Container>
  );
}

export default Camera;
