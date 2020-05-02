import React, { Component } from "react";
import Table from "./Table";

class SearchResults extends Component {
  columns = [
    {
      path: "image",
      label: "Image",
      content: (result) => (
        <img
          height={150}
          src={"http://139.59.68.43/" + result.originalImagePath}
        />
      ),
    },
    {
      path: "text",
      label: "Text",
    },
  ];

  render() {
    const { results, onSort, sortColumn } = this.props;

    return (
      <Table
        columns={this.columns}
        data={results}
        sortColumn={sortColumn}
        onSort={onSort}
      />
    );
  }
}

export default SearchResults;
