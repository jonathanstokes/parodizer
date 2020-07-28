import React, { ChangeEvent } from 'react';

interface SearchInputFieldProps {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSearch: (query: string) => void;
}
const SearchInputField = (props: SearchInputFieldProps) => {
  const { value, onChange, onSearch } = props;
  const onSubmit = (event: any) => {
    event.preventDefault();
    onSearch(value);
  };
  return (
    <form className="search-input-field" onSubmit={onSubmit}>
      <input type="text" value={value} onChange={(event) => onChange(event)} />
    </form>
  );
};

export default SearchInputField;
