import React from "react";
import { useNavigate } from "react-router";
import styled from "styled-components";

function Choose() {
  const navigate = useNavigate();

  return (
    <Container>
      <Info>원하는 방식을 선택해주세요.</Info>
      <Btn
        onClick={() => {
          navigate("/camera/both");
        }}
      >
        결막 + 손톱
      </Btn>
      <Btn
        onClick={() => {
          navigate("/camera/eye");
        }}
      >
        only 결막
      </Btn>
      <Btn
        onClick={() => {
          navigate("/camera/nail");
        }}
      >
        only 손톱
      </Btn>
    </Container>
  );
}

export default Choose;

const Container = styled.div`
  display: flex;
  width: 100vw;
  max-width: 430px; /* 최대 너비 제한 (예: iPhone 14 Pro Max 크기) */
  height: 100vh;
  flex-direction: column;
  align-items: center;
  background-color: rgb(0, 45, 86);
  padding: 20px;
  padding-top: 100px;
  padding-bottom: 80px;
  overflow-y: auto;
  box-sizing: border-box;
  margin: 0 auto; /* 가운데 정렬 (작은 화면에서는 영향 없지만, 데스크톱에서 보기 좋게) */
`;

const Info = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin-top: 100px;
`;

const ButtonDiv = styled.button`
  width: 100px;
  height: 50px;
  color: ss;
`;

const Btn = styled.button`
  width: 150px;
  height: 65px;
  margin: 25px;
  color: white;
  background-color: rgba(252, 252, 252, 0.6);
  border: none;
  border-radius: 50px;
  font-size: 16px;
  font-family: "Noto Sans", sans-serif;
  font-weight: 600;
  &:hover {
    box-shadow: 0 0 10px white, 0 0 20px white,
      0 0 30px rgba(255, 255, 255, 0.4);
  }

  &:active {
    box-shadow: 0 0 15px white, 0 0 30px white,
      0 0 40px rgba(255, 255, 255, 0.4);
    transform: scale(0.97);
  }
`;
