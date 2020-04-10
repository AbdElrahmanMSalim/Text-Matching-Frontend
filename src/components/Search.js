import React from "react";
import Input from "./input";

const Search = ({ onChange, value }) => {
  return (
    <Input
      placeholder="Search..."
      onChange={(e) => onChange(e.currentTarget.value)}
      value={value}
    ></Input>
  );
};

export default Search;
