import { Colors, FontFamily, MediaQueries } from "@/styles/variables";
import { useRouter } from "next/router";
import React from "react";
import styled from "styled-components";

const CallToActionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  text-align: center;
  padding: 80px 32px;
  background: radial-gradient(
    ellipse at 50% 0%,
    rgba(255, 107, 43, 0.12) 0%,
    transparent 70%
  );
  border-top: 1px solid rgba(255, 107, 43, 0.2);

  @media ${MediaQueries.MD} {
    padding: 100px 64px;
  }
`;

const Title = styled.h2`
  font-family: ${FontFamily.display};
  font-size: 40px;
  font-weight: 800;
  margin-bottom: 8px;
  color: ${Colors.brand.white};
  line-height: 1.1;
`;

const Description = styled.p`
  font-size: 16px;
  line-height: 1.65;
  color: ${Colors.lightGray};
  opacity: 0.75;
  max-width: 520px;
  margin: 0 auto;
`;

const CTAButton = styled.button`
  padding: 16px 40px;
  font-size: 17px;
  font-weight: 700;
  background-color: ${Colors.brand.accent};
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease,
    box-shadow 0.2s ease;
  width: 240px;
  align-self: center;
  box-shadow: 0 0 28px rgba(255, 107, 43, 0.4);

  &:hover {
    background-color: ${Colors.brand.accentHover};
    transform: translateY(-2px);
    box-shadow: 0 0 44px rgba(255, 107, 43, 0.55);
  }

  &:active {
    transform: translateY(0);
  }
`;

const NoCreditCard = styled.p`
  font-size: 12px;
  color: ${Colors.midGray};
  margin: -8px 0 0;
  letter-spacing: 0.3px;
`;

const CTACard: React.FC = () => {
  const router = useRouter();

  return (
    <CallToActionContainer>
      <Title>Your next client deserves a better system.</Title>
      <Description>
        Stop patching together spreadsheets and separate apps. Start your free
        trial today. Your first plan ships in under 10 minutes, no setup fee, no
        contract.
      </Description>
      <CTAButton onClick={() => router.push("/auth?path=SignUp")}>
        Start your free trial
      </CTAButton>
      <NoCreditCard>No credit card · No contract · Cancel anytime</NoCreditCard>
    </CallToActionContainer>
  );
};

export default CTACard;
