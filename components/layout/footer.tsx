import { Colors, FontFamily, MediaQueries } from "@/styles/variables";
import Image from "next/image";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import styled from "styled-components";

const Footer = () => {
  return (
    <FooterContainer>
      <FooterInner>
        {/* Brand block */}
        <BrandBlock>
          <BrandRow>
            <Image
              src="/assets/dumbbell.svg"
              height={28}
              width={28}
              alt="Gymnosis logo"
            />
            <BrandName>Gymnosis</BrandName>
          </BrandRow>
          <BrandTagline>
            Gym management built for professional trainers.
          </BrandTagline>
          <SocialRow>
            <SocialLink
              href="https://instagram.com/gymnosis"
              aria-label="Gymnosis on Instagram"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram size={20} />
            </SocialLink>
            <SocialLink
              href="https://facebook.com/gymnosis"
              aria-label="Gymnosis on Facebook"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebook size={20} />
            </SocialLink>
            <SocialLink
              href="https://twitter.com/gymnosis"
              aria-label="Gymnosis on Twitter"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTwitter size={20} />
            </SocialLink>
          </SocialRow>
        </BrandBlock>

        {/* Link columns */}
        <LinksBlock>
          <LinkColumn>
            <ColumnHeading>Product</ColumnHeading>
            <FooterLink href="/education">Features</FooterLink>
            <FooterLink href="/education">Documentation</FooterLink>
            <FooterLink href="/news">Newsfeed</FooterLink>
          </LinkColumn>
          <LinkColumn>
            <ColumnHeading>Company</ColumnHeading>
            <FooterLink href="/terms-of-service">Terms of Service</FooterLink>
          </LinkColumn>
          <LinkColumn>
            <ColumnHeading>Account</ColumnHeading>
            <FooterLink href="/auth?path=SignUp">Get Started</FooterLink>
            <FooterLink href="/auth?path=SignIn">Sign In</FooterLink>
          </LinkColumn>
        </LinksBlock>
      </FooterInner>

      <FooterBottom>
        <span>© {new Date().getFullYear()} Gymnosis. All rights reserved.</span>
      </FooterBottom>
    </FooterContainer>
  );
};

const FooterContainer = styled.footer`
  width: 100%;
  background: ${Colors.midnight};
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  color: ${Colors.brand.white};
`;

const FooterInner = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 56px 32px 40px;
  display: flex;
  flex-direction: column;
  gap: 48px;

  @media ${MediaQueries.MD} {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    gap: 64px;
  }
`;

const BrandBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 240px;
`;

const BrandRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const BrandName = styled.span`
  font-family: ${FontFamily.primary};
  font-size: 18px;
  font-weight: 700;
  color: ${Colors.brand.accent};
  letter-spacing: -0.3px;
`;

const BrandTagline = styled.p`
  font-size: 13px;
  color: ${Colors.midGray};
  line-height: 1.5;
  margin: 0;
`;

const SocialRow = styled.div`
  display: flex;
  gap: 16px;
  padding-top: 4px;
`;

const SocialLink = styled.a`
  color: ${Colors.midGray};
  transition: color 0.2s ease;

  &:hover {
    color: ${Colors.brand.accent};
  }
`;

const LinksBlock = styled.div`
  display: flex;
  gap: 48px;
  flex-wrap: wrap;

  @media ${MediaQueries.MD} {
    gap: 64px;
    flex-wrap: nowrap;
  }
`;

const LinkColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ColumnHeading = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: ${Colors.brand.accent};
  margin-bottom: 4px;
`;

const FooterLink = styled(Link)`
  font-size: 14px;
  color: ${Colors.midGray};
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: ${Colors.brand.white};
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding: 20px 32px;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;

  span {
    font-size: 12px;
    color: ${Colors.midGray};
  }
`;

export default Footer;
