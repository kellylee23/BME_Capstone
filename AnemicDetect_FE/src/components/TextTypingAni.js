import React, { useEffect, useState } from "react";
import styled from "styled-components";

const TextTypingAni = ({ text }) => {
  const [sequence, setSequence] = useState("");
  const [textCount, setTextCount] = useState(0);
  const [isTypingPaused, setIsTypingPaused] = useState(false);

  useEffect(() => {
    const typingInterval = setInterval(() => {
      if (isTypingPaused) {
        clearInterval(typingInterval);
        setTimeout(() => {
          setIsTypingPaused(false);
          setTextCount(0);
          setSequence("");
        }, 7000);
        return;
      }

      if (textCount >= text.length) {
        setIsTypingPaused(true);
        return;
      }

      const nextChar = text[textCount];
      setSequence((prevSequence) => prevSequence + nextChar);

      if (nextChar === "\n") {
        setTextCount((prevCount) => prevCount + 2);
      } else {
        setTextCount((prevCount) => prevCount + 1);
      }
    }, 200);

    return () => clearInterval(typingInterval);
  }, [text, textCount, isTypingPaused]);

  return (
    <StyledText>
      {sequence}
      <Cursor />
    </StyledText>
  );
};

export default TextTypingAni;

// 스타일 컴포넌트 정의
const StyledText = styled.div`
  white-space: pre-line;
  word-break: break-word;
  font-family: "Lexend Zetta", sans-serif;
  font-size: 30px;
  font-weight: 700;
  color: white;
  overflow: hidden;
  text-align: center;
  margin-top: 130px;
`;

const Cursor = styled.span`
  display: inline-block;
  width: 0.5ch;
  height: 1em;
  background-color: white;
  margin-left: 0.25rem;
  animation: blink 1s step-end infinite;

  @keyframes blink {
    50% {
      opacity: 0;
    }
  }
`;
