import React from "react";
import _ from "lodash";
import { Button } from "reactstrap";
import ImageUploader from "react-images-upload";
import http from "../services/httpServices";
import Search from "./Search";
import Pagination from "./Pagination";
import SearchResults from "./SearchResults";
import { paginate } from "../utils/paginate";

const questionImagesRoute = "http://139.59.68.43:8000/api/questionImages";
const searchRoute = "http://139.59.68.43:8000/api/search";
//139.59.68.43

export default class Upload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      successfulImages: [],
      failedImages: [],
      pictures: [],
      result: {},
      sortColumn: { path: "similarity", order: "desc" },
      searchQuery: "",
      currentPage: 1,
      pageSize: 4,
    };
    this.onDropDB = this.onDropDB.bind(this);
    this.handleOnSubmit = this.handleOnSubmit.bind(this);
  }

  async componentDidMount() {
    const result = await http.get(searchRoute);
    this.setState({ result });
  }

  onDropDB(picture) {
    this.setState({
      pictures: picture,
    });
  }

  async handleOnSubmit(e) {
    e.preventDefault();

    if (!this.state.pictures.length) alert("No pictures attached");
    for (const pic of this.state.pictures) {
      if (!pic) return alert("No pictures attached");
      const title = pic.size + "-" + pic.name;

      const data = new FormData();
      data.append("title", title);
      data.append("image", pic);

      try {
        const response = await http.post(questionImagesRoute, data);
        if (response.status === 400) {
          // alert("Failed in image: " + pic.name + " with error: " + response.data);
          this.setState({
            failedImages: {
              ...this.state.failedImages,
              [pic.name]: response.data,
            },
          });
        } else {
          // alert("Success");
          console.log(title, " is stored successfully: ", response);
          this.setState({
            successfulImages: [...this.state.successfulImages, pic.name],
          });
        }
      } catch (err) {
        console.log(err);
        if (err.response) {
          // alert(
          //   "Failed in image: " + pic.name + " with error: " + err.response.data
          // );
          this.setState({
            failedImages: [
              ...this.state.failedImages,
              { name: title, error: err.response.data },
            ],
          });
        }
      }
    }
    alert("Finished");
  }

  handleSort = (sortColumn) => {
    this.setState({ sortColumn });
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  handleSearchChange = (query) => {
    this.setState({
      searchQuery: query,
      currentPage: 1,
      selectedGenre: null,
    });
  };

  getPagedData = () => {
    const {
      pageSize,
      currentPage,
      sortColumn,
      searchQuery,
      result: backendResults,
    } = this.state;

    const searchResults = searchQuery
      ? backendResults.data.filter((el) =>
          el.text.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : null;

    let ordered = _.sortBy(
      searchResults ? searchResults : backendResults.scores,
      [
        function (obj) {
          return parseFloat(obj[sortColumn.path]);
        },
      ]
    );
    if (sortColumn.order === "desc") {
      ordered = ordered.reverse();
    }

    const results = paginate(ordered, currentPage, pageSize);

    return { totalCount: ordered.length, data: results };
  };

  render() {
    const { pageSize, currentPage, sortColumn, searchQuery } = this.state;

    const { totalCount, data: results } = this.getPagedData();

    return (
      <div className="container-fluid m-5 ">
        <div className="row">
          <div className="col-sm ">
            <div className="row justify-content-md-center m-2">
              <h1> Store in Database </h1>
            </div>
            <form onSubmit={this.handleOnSubmit}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Button color="primary" type="submit" style={{ margin: 5 }}>
                  Store in the database
                </Button>
              </div>
              <ImageUploader
                withIcon={true}
                buttonText="Choose images"
                onChange={this.onDropDB}
                imgExtension={[".jpg", ".jpeg", ".png"]}
                label="Max file size: 5mb, accepted: jpg, png"
                maxFileSize={5242880}
                withPreview
              />
            </form>
          </div>
        </div>

        {this.state.failedImages ? (
          <React.Fragment>
            {this.state.failedImages.map(({ name, error }) => (
              <h5 className="m-3">
                {name}, {error}
              </h5>
            ))}
          </React.Fragment>
        ) : null}

        <div className="row justify-content-md-center m-2">
          <h1> Search in Database </h1>
        </div>
        <div className="row d-flex justify-content-center">
          <Search
            value={searchQuery}
            onChange={this.handleSearchChange}
          ></Search>
          {results.length ? (
            <React.Fragment>
              <SearchResults
                results={results}
                sortColumn={sortColumn}
                onSort={this.handleSort}
              />
              <Pagination
                itemsCount={totalCount}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={this.handlePageChange}
              />
            </React.Fragment>
          ) : null}
        </div>
      </div>
    );
  }
}
