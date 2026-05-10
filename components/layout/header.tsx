import { checkIsAdmin, checkIsAdminOrTrainer } from "@/helpers/auth/auth";
import { Colors, MediaQueries } from "@/styles/variables";
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
      { key: 1, route: "/news", guarded: false, text: "News" },
      id && { key: 2, route: `/client/${id}`, guarded: false, text: "Profile" },
      // @ts-ignore: next-auth type issue v3
      checkIsAdmin(session?.user?.role) && {
        key: 3,
        route: "/admin",
        guarded: true,
        text: "Admin",
      },
      // @ts-ignore: next-auth type issue v3
      checkIsAdminOrTrainer(session?.user?.role) && {
        key: 4,
        route: "/client",
        guarded: true,
        text: "Client Dashboard",
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
      if (!route?.key) return null;

      // const isGuardedAndAllowed = route.guarded && !!session;
      // const isUnguarded = !route.guarded;

      // if (!isGuardedAndAllowed && !isUnguarded) return null;

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
  }, [routes, selectedRoute, session]);

  return (
    <NavBar role="navigation" aria-label="Main navigation">
      <NavInner>
        <BrandLink href="/" onClick={() => setSelectedRoute("")}>
          <Image
            src="/assets/dumbbell.svg"
            height={40}
            width={40}
            alt="Gymnosis logo"
          />
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
                Sign Out
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
  color: ${Colors.brand.white};
  position: fixed;
  top: 0;
  width: 100vw;
  z-index: 1000;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

const NavInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const BrandLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
`;

const BrandName = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: ${Colors.brand.accent};
  letter-spacing: -0.3px;
`;

const NavMenu = styled.div<{ open: boolean }>`
  display: ${({ open }) => (open ? "flex" : "none")};
  flex-direction: column;
  position: absolute;
  top: 64px;
  left: 0;
  right: 0;
  background-color: ${Colors.midnight};
  padding: 16px 24px 24px;
  gap: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

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

const NavLink = styled(Link)`
  color: ${Colors.brand.white};
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  padding: 10px 14px;
  border-radius: 6px;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.07);
  }
`;

const ActiveIndicator = styled.span`
  height: 2px;
  background-color: ${Colors.brand.accent};
  border-radius: 1px;
  margin: 0 14px;
`;

const MobileToggle = styled.button`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;

  @media ${MediaQueries.MD} {
    display: none;
  }
`;

const HamburgerBar = styled.span`
  display: block;
  width: 22px;
  height: 2px;
  background-color: ${Colors.brand.white};
  border-radius: 1px;
`;

const SignOutButton = styled.button`
  background: none;
  border: none;
  padding: 10px 14px;
  font: inherit;
  font-weight: 600;
  font-size: 14px;
  color: ${Colors.brand.white};
  cursor: pointer;
  text-align: left;
  border-radius: 6px;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.07);
  }
`;

export default Header;
