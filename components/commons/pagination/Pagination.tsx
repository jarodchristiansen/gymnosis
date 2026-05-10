import { Colors } from "@/styles/variables";
import React from "react";
import styled from "styled-components";

interface PaginationComponentProps {
  active: number;
  setOffsetState: (number: number) => void;
  fetchMore: any;
  refetch: any;
}

const PaginationComponent = ({
  active,
  setOffsetState,
  fetchMore,
  refetch,
}: PaginationComponentProps) => {
  const start = active > 2 ? active - 2 : 1;
  const items: number[] = [];

  for (let n = start; n <= active + 2; n++) {
    items.push(n);
  }

  const goTo = (page: number) => {
    refetch({ offset: page });
    setOffsetState(page);
  };

  return (
    <PaginationWrapper data-testid="pagination-component">
      <PageButton
        type="button"
        onClick={() => goTo(active - 1)}
        disabled={active <= 1}
        data-testid="pagination-key-previous"
        aria-label="Previous page"
      >
        ‹
      </PageButton>

      {items.map((n) => (
        <PageButton
          key={n}
          type="button"
          data-cy="pagination-page"
          data-testid={`pagination-key-${n}`}
          active={n === active}
          onClick={() => goTo(n)}
          aria-current={n === active ? "page" : undefined}
        >
          {n}
        </PageButton>
      ))}

      <PageButton
        type="button"
        onClick={() => goTo(active + 1)}
        data-testid="pagination-key-next"
        aria-label="Next page"
      >
        ›
      </PageButton>
    </PaginationWrapper>
  );
};

const PaginationWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 0;
`;

const PageButton = styled.button<{ active?: boolean }>`
  min-width: 36px;
  height: 36px;
  padding: 0 8px;
  border-radius: 6px;
  border: 1px solid
    ${({ active }) => (active ? Colors.brand.accent : "rgba(255,255,255,0.12)")};
  background-color: ${({ active }) =>
    active ? Colors.brand.accent : "transparent"};
  color: ${({ active }) => (active ? Colors.brand.white : Colors.lightGray)};
  font-size: 14px;
  font-weight: ${({ active }) => (active ? "700" : "400")};
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;

  &:hover:not(:disabled) {
    background-color: ${({ active }) =>
      active ? Colors.brand.accentHover : "rgba(255,255,255,0.07)"};
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;

export default PaginationComponent;
