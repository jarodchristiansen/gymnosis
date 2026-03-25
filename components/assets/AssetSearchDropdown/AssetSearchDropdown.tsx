import { GET_ASSET } from "@/helpers/queries/assets";
import { useLazyQuery } from "@apollo/client";
import type { ChangeEvent, KeyboardEvent } from "react";
import { useEffect, useId, useMemo, useState } from "react";
import styled from "styled-components";

type AssetSearchDropdownProps = {
  type: string;
  addAssetMethod: (symbol: string) => void;
};

const AssetSearchDropdown = ({
  type,
  addAssetMethod,
}: AssetSearchDropdownProps) => {
  const inputId = useId();
  const listboxId = useId();
  const [searchValue, setSearchValue] = useState("");
  const [getAsset, { data }] = useLazyQuery(GET_ASSET);
  const [isOpen, setIsOpen] = useState(false);
  const [activeOptionIndex, setActiveOptionIndex] = useState(-1);

  const assetList = useMemo(() => data?.getAsset ?? [], [data?.getAsset]);

  const updateSearchValue = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);

    if (value.length > 2 && (type === "Crypto" || type === "TradFI")) {
      getAsset({
        variables: { symbol: value, type },
      });
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!data || data?.getAsset?.length === 0) {
      setIsOpen(false);
    }
  }, [data]);

  useEffect(() => {
    const showList = isOpen && assetList.length > 0;
    if (!showList) {
      setActiveOptionIndex(-1);
      return;
    }
    setActiveOptionIndex((prev) =>
      prev < 0 ? 0 : Math.min(prev, assetList.length - 1)
    );
  }, [isOpen, assetList]);

  const showList = isOpen && assetList.length > 0;
  const activeOptionId =
    showList && activeOptionIndex >= 0
      ? `${listboxId}-opt-${activeOptionIndex}`
      : undefined;

  const selectAsset = (symbol: string) => {
    addAssetMethod(symbol);
    setIsOpen(false);
    setSearchValue("");
    setActiveOptionIndex(-1);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showList) {
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveOptionIndex((i) =>
        Math.min(i < 0 ? 0 : i + 1, assetList.length - 1)
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveOptionIndex((i) => Math.max((i < 0 ? 0 : i) - 1, 0));
    } else if (e.key === "Enter") {
      const pick =
        activeOptionIndex >= 0 ? assetList[activeOptionIndex] : assetList[0];
      if (pick) {
        e.preventDefault();
        selectAsset(pick.symbol);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setActiveOptionIndex(-1);
    }
  };

  return (
    <DropdownContainer>
      <label htmlFor={inputId}>Asset Search</label>
      <Input
        id={inputId}
        type="text"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-activedescendant={activeOptionId}
        value={searchValue}
        onChange={updateSearchValue}
        onKeyDown={handleInputKeyDown}
        autoComplete="off"
      />

      {showList ? (
        <OptionsList
          id={listboxId}
          role="listbox"
          aria-label="Asset matches"
          className="option-container"
        >
          {assetList.map((assetOpt, index) => (
            <OptionButton
              key={assetOpt.id ?? `${assetOpt.symbol}-${assetOpt.name}`}
              id={`${listboxId}-opt-${index}`}
              type="button"
              tabIndex={-1}
              role="option"
              aria-selected={index === activeOptionIndex}
              onMouseEnter={() => setActiveOptionIndex(index)}
              onClick={() => selectAsset(assetOpt.symbol)}
            >
              {assetOpt.symbol.toUpperCase()} - {assetOpt.name}
            </OptionButton>
          ))}
        </OptionsList>
      ) : null}
    </DropdownContainer>
  );
};

const DropdownContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;

  .option-container {
    list-style: none;
    margin: 0;
    padding: 0;
    border: 1px solid black;
    position: absolute;
    top: 80px;
    background-color: white;
    z-index: 100;
    max-height: 200px;
    overflow-y: auto;
  }
`;

const OptionsList = styled.div``;

const OptionButton = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  border: none;
  border-top: 1px solid black;
  border-bottom: 1px solid black;
  padding: 12px;
  cursor: pointer;
  background: white;

  &:hover {
    background-color: blue;
    color: white;
  }
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 8px;
`;

export default AssetSearchDropdown;
