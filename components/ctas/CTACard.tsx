import { Colors, MediaQueries } from "@/styles/variables";
import React from "react";
import styled from "styled-components";

const CallToActionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  text-align: center;
  padding: 32px;

  @media ${MediaQueries.MD} {
    padding: 64px;
  }
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 16px;
  color: ${Colors.elegant.white};
`;

const Description = styled.p`
  font-size: 16px;
  color: ${Colors.lightGray};
`;

const CTAButton = styled.button`
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  background-color: ${Colors.elegant.accentPurple};
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 200px;
  align-self: center;

  &:hover {
    background-color: #0056b3;
  }
`;

const CTACard: React.FC = () => {
  return (
    <CallToActionContainer>
      <Title>Get started with Gymnosis today!</Title>
      <Description>
        Take control of your training journey with Gymnosis today! Sign up now
        to explore the power of simplified data insights, seamless fitness
        tracking, and a vibrant community of fitness enthusiasts. Join the
        Gymnosis family and unleash the full potential of your time!
      </Description>
      <CTAButton>Sign up now</CTAButton>
    </CallToActionContainer>
  );
};

export default CTACard;
