import { Colors } from "@/styles/variables";
import { signOut, useSession } from "next-auth/react";
import styled from "styled-components";

import Footer from "./footer";
import Header from "./header";

function Layout(props) {
  const { data: session } = useSession();
  // @ts-expect-error next-auth user extended with demo
  const isDemo = !!session?.user?.demo;

  return (
    <LayoutContainer>
      <Header />
      <PageWrapper>
        {isDemo && (
          <DemoBanner role="note">
            You&apos;re in a demo gym with example data. It&apos;s yours alone
            and is deleted after 24 hours.{" "}
            <button type="button" onClick={() => signOut({ callbackUrl: "/" })}>
              Leave the demo
            </button>
          </DemoBanner>
        )}
        {props.children}
      </PageWrapper>
      <Footer />
    </LayoutContainer>
  );
}

const PageWrapper = styled.main`
  padding: 88px 0;
`;

const DemoBanner = styled.p`
  margin: 0 16px 16px;
  padding: 10px 14px;
  border-radius: 8px;
  background: rgba(255, 107, 43, 0.1);
  border: 1px solid rgba(255, 107, 43, 0.3);
  color: ${Colors.lightGray};
  font-size: 14px;
  text-align: center;

  button {
    background: none;
    border: none;
    padding: 0;
    color: ${Colors.brand.accentLight};
    font: inherit;
    font-weight: 600;
    text-decoration: underline;
    cursor: pointer;
  }
`;

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${Colors.richBlack};
  position: relative;
`;

export default Layout;
