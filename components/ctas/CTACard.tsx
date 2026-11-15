import DemoLauncher from "@/components/demo/DemoLauncher";
import { Colors, FontFamily, MediaQueries } from "@/styles/variables";
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

const DemoWrap = styled.div`
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
  text-align: left;
`;

const CTACard: React.FC = () => {
  return (
    <CallToActionContainer>
      <Title>Try Gymnosis.</Title>
      <Description>
        Step into a demo gym as a trainer, a client, or the owner. No sign-up.
      </Description>
      <DemoWrap>
        <DemoLauncher />
      </DemoWrap>
    </CallToActionContainer>
  );
};

export default CTACard;
