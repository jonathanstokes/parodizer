import React from 'react';

interface SearchInputFieldProps {
  onSearch: (query: string) => void;
}
const SearchInputField = (props: SearchInputFieldProps & React.InputHTMLAttributes<HTMLInputElement>) => {
  const { onSearch, ...inputProps } = props;
  const onSubmit = (event: any) => {
    event.preventDefault();
    const value = inputProps.value as string;
    onSearch(value);
  };
  return (
    <form className="search-input-field" onSubmit={onSubmit}>
      <input type="text" {...inputProps} />
    </form>
  );
};

export default SearchInputField;
