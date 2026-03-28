import { GET_ASSET } from "@/helpers/queries/assets";
import { useLazyQuery } from "@apollo/client";
import type { ChangeEvent, KeyboardEvent } from "react";
import { useId, useMemo, useState } from "react";
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
  const datalistId = useId();
  const [searchValue, setSearchValue] = useState("");
  const [getAsset, { data }] = useLazyQuery(GET_ASSET);

  const assetList = useMemo(() => data?.getAsset ?? [], [data?.getAsset]);

  const selectAsset = (symbol: string) => {
    addAssetMethod(symbol);
    setSearchValue("");
  };

  const updateSearchValue = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const list = data?.getAsset ?? [];
    const trimmed = value.trim();
    const matched = list.find(
      (a) => a.symbol.toLowerCase() === trimmed.toLowerCase()
    );
    if (matched) {
      selectAsset(matched.symbol);
      return;
    }

    setSearchValue(value);

    if (value.length > 2 && (type === "Crypto" || type === "TradFI")) {
      getAsset({
        variables: { symbol: value, type },
      });
    }
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setSearchValue("");
    }
  };

  return (
    <DropdownContainer>
      <label htmlFor={inputId}>Asset Search</label>
      <Input
        id={inputId}
        type="text"
        list={datalistId}
        value={searchValue}
        onChange={updateSearchValue}
        onKeyDown={handleInputKeyDown}
        autoComplete="off"
      />

      <datalist id={datalistId}>
        {assetList.map((assetOpt) => (
          <option
            key={assetOpt.id ?? `${assetOpt.symbol}-${assetOpt.name}`}
            value={assetOpt.symbol}
            label={`${assetOpt.symbol.toUpperCase()} — ${assetOpt.name}`}
          />
        ))}
      </datalist>
    </DropdownContainer>
  );
};

const DropdownContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 8px;
`;

export default AssetSearchDropdown;
