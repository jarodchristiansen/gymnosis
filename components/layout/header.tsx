import { checkIsAdmin, checkIsStaff } from "@/helpers/auth/auth";
import { Colors, FontFamily, MediaQueries } from "@/styles/variables";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";

function Header() {
  const { data: session } = useSession();
  const [selectedRoute, setSelectedRoute] = useState<string | number>("");
  const [menuOpen, setMenuOpen] = useState(false);

  const router = useRouter();
  const { asPath } = router;

  const handleSignout = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedRoute("");
    setMenuOpen(false);
    signOut();
  };

  const handleSelect = (key: string | number) => {
    setSelectedRoute(key);
    setMenuOpen(false);
  };

  // @ts-ignore: next-auth type issue v3
  const id = session?.user?.id;

  type NavRoute = {
    key: number;
    route: string;
    guarded: boolean;
    text: string;
  };

  const routes: NavRoute[] = useMemo(() => {
    return [
      { key: 0, route: "/education", guarded: false, text: "Features" },
      // Clients' own plans live on their dashboard; staff work from Clients and Plans.
      id &&
        // @ts-ignore: next-auth type issue v3
        session?.user?.role === "client" && {
          key: 2,
          route: `/client/${id}`,
          guarded: false,
          text: "My plan",
        },
      // @ts-ignore: next-auth type issue v3
      checkIsAdmin(session?.user?.role) && {
        key: 3,
        route: "/admin",
        guarded: true,
        text: "Admin",
      },
      // @ts-ignore: next-auth type issue v3
      checkIsStaff(session?.user?.role) && {
        key: 4,
        route: "/client",
        guarded: true,
        text: "Clients",
      },
      // @ts-ignore: next-auth type issue v3
      checkIsStaff(session?.user?.role) && {
        key: 6,
        route: "/plans",
        guarded: true,
        text: "Plans",
      },
      !session && {
        key: 5,
        route: "/auth?path=SignIn",
        guarded: false,
        text: "Sign In",
      },
    ].filter((r): r is NavRoute => Boolean(r));
  }, [id, session]);

  useEffect(() => {
    const matchingRoute = routes.filter((item) => asPath.includes(item.route));
    if (matchingRoute.length) {
      setSelectedRoute(matchingRoute[0].key);
    }
  }, [asPath, routes]);

  const routeItems = useMemo(() => {
    if (!routes?.length) return [];

    return routes.map((route) => {
      // Keys start at 0, so check for the route itself, not a truthy key.
      if (!route) return null;

      return (
        <NavItem key={route.route}>
          <NavLink
            href={route.route}
            onClick={() => handleSelect(route.key)}
            aria-current={selectedRoute === route.key ? "page" : undefined}
          >
            {route.text}
          </NavLink>
          {selectedRoute === route.key && <ActiveIndicator />}
        </NavItem>
      );
    });
  }, [routes, selectedRoute]);

  return (
    <NavBar role="navigation" aria-label="Main navigation">
      <NavInner>
        <BrandLink href="/" onClick={() => setSelectedRoute("")}>
          <Image src="/assets/dumbbell.svg" height={28} width={28} alt="" />
          <BrandName>Gymnosis</BrandName>
        </BrandLink>

        <MobileToggle
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="nav-menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <HamburgerBar />
          <HamburgerBar />
          <HamburgerBar />
        </MobileToggle>

        <NavMenu id="nav-menu" open={menuOpen}>
          {routeItems}
          {session && (
            <NavItem>
              <SignOutButton type="button" onClick={handleSignout}>
                Sign out
              </SignOutButton>
            </NavItem>
          )}
        </NavMenu>
      </NavInner>
    </NavBar>
  );
}

const NavBar = styled.nav`
  background-color: ${Colors.midnight};
  color: ${Colors.lightGray};
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
  border-bottom: 1px solid ${Colors.rule};
`;

const NavInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media ${MediaQueries.MD} {
    padding: 0 24px;
  }
`;

const BrandLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  text-decoration: none;
`;

const BrandName = styled.span`
  font-family: ${FontFamily.display};
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${Colors.lightGray};
`;

const NavMenu = styled.div<{ open: boolean }>`
  display: ${({ open }) => (open ? "flex" : "none")};
  flex-direction: column;
  position: absolute;
  top: 64px;
  left: 0;
  right: 0;
  background-color: ${Colors.midnight};
  padding: 8px 16px 20px;
  gap: 2px;
  border-bottom: 1px solid ${Colors.rule};

  @media ${MediaQueries.MD} {
    display: flex;
    flex-direction: row;
    position: static;
    background: none;
    padding: 0;
    gap: 4px;
    border: none;
    align-items: center;
  }
`;

const NavItem = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
`;

const navText = `
  font-family: ${FontFamily.display};
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const NavLink = styled(Link)`
  ${navText}
  color: ${Colors.lightGray};
  text-decoration: none;
  padding: 10px 12px;
  border-radius: 4px;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: rgba(242, 238, 232, 0.06);
  }

  &[aria-current="page"] {
    color: ${Colors.brand.accentLight};
  }
`;

const ActiveIndicator = styled.span`
  height: 2px;
  background-color: ${Colors.brand.accent};
  margin: 0 12px;
`;

const MobileToggle = styled.button`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: 44px;
  height: 44px;
  background: none;
  border: none;
  cursor: pointer;

  @media ${MediaQueries.MD} {
    display: none;
  }
`;

const HamburgerBar = styled.span`
  display: block;
  width: 22px;
  height: 2px;
  background-color: ${Colors.lightGray};
`;

const SignOutButton = styled.button`
  ${navText}
  background: none;
  border: none;
  padding: 10px 12px;
  color: ${Colors.midGray};
  cursor: pointer;
  text-align: left;
  border-radius: 4px;

  &:hover {
    color: ${Colors.lightGray};
    background-color: rgba(242, 238, 232, 0.06);
  }
`;

export default Header;
