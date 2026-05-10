import { Colors } from "@/styles/variables";
import styled from "styled-components";

import Footer from "./footer";
import Header from "./header";

function Layout(props) {
  return (
    <LayoutContainer>
      <Header />
      <PageWrapper>{props.children}</PageWrapper>
      <Footer />
    </LayoutContainer>
  );
}

const PageWrapper = styled.main`
  padding: 88px 0;
`;

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${Colors.richBlack};
  position: relative;
`;

export default Layout;
