import { GET_ASSET } from "@/helpers/queries/assets";
import { useLazyQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import styled from "styled-components";

const AssetSearchDropdown = ({ type, addAssetMethod }) => {
  const [searchValue, setSearchValue] = useState("");
  const [getAsset, { data }] = useLazyQuery(GET_ASSET);
  const [isOpen, setIsOpen] = useState(false);

  const updateSearchValue = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    if (value.length > 2 && (type === "Crypto" || type === "TradFI")) {
      getAsset({
        variables: { symbol: value, type },
      });
      setIsOpen(true);
    }
  };

  useEffect(() => {
    if (!data || data?.getAsset?.length === 0) {
      setIsOpen(false);
    }
  }, [data]);

  return (
    <DropdownContainer>
      <label htmlFor="asset-search">Asset Search</label>
      <Input
        id="asset-search"
        type="text"
        value={searchValue}
        onChange={updateSearchValue}
        autoComplete="off"
      />

      {isOpen && data && data?.getAsset?.length > 0 && (
        <ul
          className="option-container"
          role="listbox"
          aria-label="Asset matches"
        >
          {data.getAsset.map((asset) => (
            <li key={asset.id ?? `${asset.symbol}-${asset.name}`}>
              <OptionButton
                type="button"
                role="option"
                onClick={() => addAssetMethod(asset.symbol)}
              >
                {asset.symbol.toUpperCase()} - {asset.name}
              </OptionButton>
            </li>
          ))}
        </ul>
      )}
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
    overflow-y: scroll;
  }
`;

const OptionButton = styled.button`
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
