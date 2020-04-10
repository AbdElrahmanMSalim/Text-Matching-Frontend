import React, { Component } from "react";
import Table from "./Table";

class ResultsTable extends Component {
  columns = [
    {
      path: "image",
      label: "Image",
      content: (result) => <img height={150} src={result.image} />,
    },
    {
      path: "question",
      label: "Question",
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

export default ResultsTable;
