import { Colors, MediaQueries } from "@/styles/variables";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import styled from "styled-components";

/**
 *
 * @returns Footer component below pages
 */
const Footer = () => {
  const routerToProfile = (_manage: boolean) => {
    /* Wire session + navigation when profile routes are enabled; use _manage for account vs profile */
  };

  return (
    <FooterContainer>
      <div className="text-column">
        <InfoColumnsContainer>
          <div className="info-column">
            <h4>News & Info</h4>

            <FooterNextLink href="/news">
              <h6>Newsfeed</h6>
            </FooterNextLink>

            <FooterNextLink href="/terms-of-service">
              <h6>Terms of Service</h6>
            </FooterNextLink>
          </div>
          <div className="info-column">
            <h4>Resources</h4>

            <Link href="/assets">
              <h6>Assets</h6>
            </Link>

            <Link href="/education">
              <h6>Education</h6>
            </Link>
          </div>
          <div className="info-column">
            <h4>Users</h4>
            <FooterTextButton
              type="button"
              onClick={() => routerToProfile(false)}
            >
              Profile
            </FooterTextButton>
            <FooterTextButton
              type="button"
              onClick={() => routerToProfile(true)}
            >
              Manage Account
            </FooterTextButton>
          </div>
        </InfoColumnsContainer>

        <div className="social-row">
          <FaInstagram size={36} />
          <FaFacebook size={36} />
          <FaTwitter size={36} />
        </div>
      </div>
    </FooterContainer>
  );
};

const FooterNextLink = styled(Link)`
  color: inherit;
  text-decoration: none;
`;

const FooterTextButton = styled.button`
  background: none;
  border: none;
  margin: 0;
  padding: 0;
  font: inherit;
  font-size: 0.67em;
  font-weight: bold;
  color: white;
  cursor: pointer;
  text-decoration: underline;
  text-align: inherit;
`;

const InfoColumnsContainer = styled.div`
  width: 100%;
  margin: 0 auto;
  display: flex;
  gap: 3rem;
  justify-content: center;
  padding-top: 2rem;

  @media ${MediaQueries.MD} {
    gap: 9rem;
  }

  .info-column {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
`;

const FooterContainer = styled.div`
  width: 100%;
  background: ${Colors.midnight};

  color: white;
  padding: 2rem 2rem;
  border-top: 2px solid gray;

  .text-column {
    display: flex;
    flex-direction: column;
    width: 100%;
    text-align: center;
    align-items: center;
    justify-content: center;
    gap: 1rem;

    h4 {
      font-weight: bold;
    }

    h6,
    ${FooterTextButton} {
      color: white;
    }
  }

  .social-row {
    padding-top: 2rem;
    display: flex;
    flex-direction: row;
    gap: 3rem;
  }
`;

export default Footer;
