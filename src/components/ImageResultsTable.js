import React, { Component } from "react";
import Table from "./Table";

class ImageResultsTable extends Component {
  columns = [
    {
      path: "testImage",
      label: "Test Image",
      content: (result) => (
        <img height={150} src={"http://139.59.68.43/" + result.testImage} />
      ),
    },
    {
      path: "image",
      label: "Image",
      content: (result) => (
        <img height={150} src={"http://139.59.68.43/" + result.image} />
      ),
    },
    {
      path: "similarity",
      label: "Score %",
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

export default ImageResultsTable;
