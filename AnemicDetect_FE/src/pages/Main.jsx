import React from "react";
import styled from "styled-components";
import TextTypingAni from "../components/TextTypingAni";
import { useNavigate } from "react-router";

const Container = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  max-width: 430px; /* 최대 너비 제한 (예: iPhone 14 Pro Max 크기) */
  height: 100vh;
  flex-direction: column;
  align-items: center;
  background-color: rgb(0, 45, 86);
  padding-top: 100px;
  padding-bottom: 80px;
  overflow-x: hidden;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  box-sizing: border-box;
  margin: 0 auto;
`;

const SubTitle = styled.div`
  position: absolute;
  font-size: 14px;
  color: white;
  bottom: 250px;
`;

const StartBtn = styled.button`
  position: absolute;
  width: 138px;
  height: 65px;
  bottom: 100px;
  color: white;
  background-color: rgba(252, 252, 252, 0.6);
  border: none;
  border-radius: 50px;
  font-size: 24px;
  font-family: "Noto Sans", sans-serif;
  font-weight: 600;
  &:hover {
    box-shadow: 0 0 10px white, 0 0 20px white,
      0 0 30px rgba(255, 255, 255, 0.4);
    transform: scale(1.05);
  }

  &:active {
    box-shadow: 0 0 15px white, 0 0 30px white,
      0 0 40px rgba(255, 255, 255, 0.4);
    transform: scale(0.97);
  }
`;

function Main() {
  const navigate = useNavigate();

  const handleOnClick = () => {
    navigate("/choose");
  };
  return (
    <Container>
      <TextTypingAni text={"Do I Look\n Pale?"} />
      <SubTitle>이미지 기반 비침습적 빈혈 스크리닝 시스템</SubTitle>
      <StartBtn onClick={handleOnClick}>start</StartBtn>
    </Container>
  );
}

export default Main;
