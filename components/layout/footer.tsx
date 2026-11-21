import { Colors, FontFamily, MediaQueries } from "@/styles/variables";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";

const Footer = () => {
  const { data: session } = useSession();

  return (
    <FooterContainer>
      <FooterInner>
        <BrandBlock>
          <BrandRow>
            <Image src="/assets/dumbbell.svg" height={24} width={24} alt="" />
            <BrandName>Gymnosis</BrandName>
          </BrandRow>
          <BrandTagline>
            AI drafts the workout plan. Safety rules check it. A trainer signs
            it off.
          </BrandTagline>
          <Credit>
            A portfolio project by{" "}
            <a href="https://jarod-christiansen.vercel.app">
              Jarod Christiansen
            </a>
            .
          </Credit>
        </BrandBlock>

        <LinksBlock aria-label="Footer">
          <LinkColumn>
            <ColumnHeading>Product</ColumnHeading>
            <FooterLink href="/education">Features</FooterLink>
            <FooterLink href="/#demo">Try the demo</FooterLink>
          </LinkColumn>
          <LinkColumn>
            <ColumnHeading>Account</ColumnHeading>
            {session ? (
              <FooterLink href="/account">Your account</FooterLink>
            ) : (
              <FooterLink href="/auth?path=SignIn">Sign in</FooterLink>
            )}
          </LinkColumn>
          <LinkColumn>
            <ColumnHeading>About</ColumnHeading>
            <FooterExternal href="https://github.com/jarodchristiansen/gymnosis">
              Source on GitHub
            </FooterExternal>
            <FooterLink href="/terms-of-service">Privacy and terms</FooterLink>
          </LinkColumn>
        </LinksBlock>
      </FooterInner>
    </FooterContainer>
  );
};

const FooterContainer = styled.footer`
  background: ${Colors.midnight};
  border-top: 1px solid ${Colors.rule};
  color: ${Colors.midGray};
`;

const FooterInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 16px;
  display: flex;
  flex-direction: column;
  gap: 40px;

  @media ${MediaQueries.MD} {
    flex-direction: row;
    justify-content: space-between;
    padding: 56px 24px;
  }
`;

const BrandBlock = styled.div`
  max-width: 340px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const BrandRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const BrandName = styled.span`
  font-family: ${FontFamily.display};
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${Colors.lightGray};
`;

const BrandTagline = styled.p`
  margin: 0;
  font-size: 15px;
  color: ${Colors.lightGray};
`;

const Credit = styled.p`
  margin: 0;
  font-size: 14px;

  a {
    color: ${Colors.brand.accentLight};
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;

const LinksBlock = styled.nav`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 32px;

  @media ${MediaQueries.MD} {
    grid-template-columns: repeat(3, auto);
    gap: 56px;
  }
`;

const LinkColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ColumnHeading = styled.span`
  margin-bottom: 4px;
  font-family: ${FontFamily.display};
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${Colors.midGray};
`;

const linkStyles = `
  display: inline-block;
  padding: 6px 0;
  font-size: 15px;
  color: ${Colors.lightGray};
  text-decoration: none;

  &:hover {
    color: ${Colors.brand.accentLight};
  }
`;

const FooterLink = styled(Link)`
  ${linkStyles}
`;

const FooterExternal = styled.a`
  ${linkStyles}
`;

export default Footer;
