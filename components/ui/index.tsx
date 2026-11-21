import { Colors, FontFamily } from "@/styles/variables";
import Link from "next/link";
import styled, { css } from "styled-components";

type Variant = "primary" | "secondary" | "ghost";

const buttonStyles = css<{ variant?: Variant }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 10px 18px;
  border-radius: 6px;
  border: 1px solid transparent;
  font-family: ${FontFamily.primary};
  font-size: 15px;
  font-weight: 650;
  line-height: 1.2;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;

  ${({ variant = "primary" }) =>
    variant === "primary"
      ? css`
          background: ${Colors.brand.accent};
          color: ${Colors.ink};

          &:hover:not(:disabled) {
            background: ${Colors.brand.accentHover};
          }
        `
      : variant === "secondary"
      ? css`
          background: transparent;
          color: ${Colors.lightGray};
          border-color: rgba(242, 238, 232, 0.28);

          &:hover:not(:disabled) {
            background: rgba(242, 238, 232, 0.06);
            border-color: rgba(242, 238, 232, 0.45);
          }
        `
      : css`
          min-height: 0;
          padding: 6px 2px;
          background: none;
          color: ${Colors.brand.accentLight};

          &:hover:not(:disabled) {
            text-decoration: underline;
          }
        `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Button = styled.button.attrs<{ variant?: Variant }>((p) => ({
  type: p.type ?? "button",
}))<{ variant?: Variant }>`
  ${buttonStyles}
`;

export const ButtonLink = styled(Link)<{ variant?: Variant }>`
  ${buttonStyles}
`;

/** Small condensed capitals above a heading, like a column label on a training sheet. */
export const Eyebrow = styled.p<{ tone?: "accent" | "muted" }>`
  margin: 0 0 8px;
  font-family: ${FontFamily.display};
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${({ tone = "accent" }) =>
    tone === "accent" ? Colors.brand.accentLight : Colors.midGray};
`;

export const DisplayHeading = styled.h1`
  margin: 0;
  font-family: ${FontFamily.display};
  font-weight: 700;
  line-height: 0.98;
  letter-spacing: 0.01em;
  text-transform: uppercase;
  text-wrap: balance;
  color: ${Colors.lightGray};
`;

/** A graphite sheet on the board: plans, panels, anything you'd clip to a clipboard. */
export const Sheet = styled.div`
  background: ${Colors.surface};
  border: 1px solid ${Colors.rule};
  border-radius: 8px;
`;

/** A rubber stamp: approval and delivery marks. */
export const Stamp = styled.span<{ tone?: "ok" | "accent" | "warn" }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 9px 2px;
  border: 2px solid currentColor;
  border-radius: 4px;
  font-family: ${FontFamily.display};
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  white-space: nowrap;
  transform: rotate(-2deg);
  color: ${({ tone = "ok" }) =>
    tone === "ok"
      ? Colors.flag.ok
      : tone === "warn"
      ? Colors.flag.warn
      : Colors.brand.accentLight};
`;

export const Page = styled.div<{ width?: number }>`
  max-width: ${({ width = 1100 }) => width}px;
  margin: 0 auto;
  padding: 32px 16px 72px;

  @media (min-width: 768px) {
    padding: 48px 24px 96px;
  }
`;
