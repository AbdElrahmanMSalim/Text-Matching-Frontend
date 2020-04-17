import React from "react";
import _ from "lodash";
import { Button } from "reactstrap";
import ImageUploader from "react-images-upload";
import http from "./services/httpServices";
import Search from "./components/Search";
import Pagination from "./components/Pagination";
import ResultsTable from "./components/ResultsTable";
import { paginate } from "./utils/paginate";
import "./App.css";

const serverIP = "http://139.59.68.43:8000";
// const serverIP = "http://localhost:8000";
const testImageRoute = serverIP + "/api/testImage";
const questionImagesRoute = serverIP + "/api/questionImages";

export default class App extends React.Component {
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
    this.onDropTest = this.onDropTest.bind(this);
    this.handleOnSubmit = this.handleOnSubmit.bind(this);
    this.handleOnSubmitTest = this.handleOnSubmitTest.bind(this);
  }

  onDropDB(picture) {
    this.setState({
      pictures: picture,
    });
  }

  onDropTest(picture) {
    this.setState({
      testPicture: picture,
    });
  }

  async handleOnSubmit(e) {
    e.preventDefault();
    for (const pic of this.state.pictures) {
      if (!pic) return alert("No pictures attached");
      const title = pic.size + "-" + pic.name;

      const data = new FormData();
      data.append("title", title);
      data.append("image", pic);
      try {
        const response = await http.post(questionImagesRoute, data);
        if (response.status === 400)
          alert("Failed in image: " + title + " with error: " + response.data);
        else console.log(title, " is stored successfully: ", response);
        if (response) alert("Success");
      } catch (err) {
        console.log(err);
        alert(
          "Failed in image: " + title + " with error: " + err.response.data
        );
      }
    }
  }

  async handleOnSubmitTest(e) {
    e.preventDefault();

    const pic = this.state.testPicture;
    if (!pic) return alert("No test pictures attached");
    const title = pic.size + "-" + pic.name;

    const data = new FormData();
    data.append("title", title);
    data.append("testImage", this.state.testPicture[0]);
    try {
      const response = await http.post(testImageRoute, data);

      if (response) alert("Success");
      this.setState({ result: response.data });
    } catch (err) {
      console.log(err);
      if (err.response) alert("Failed: " + err.response.data);
    }
  }

  storeTestImageInDB = async () => {
    const pic = this.state.testPicture;
    if (!pic) return alert("No test pictures attached");

    const title = pic[0].size + "-" + pic[0].name;

    const data = new FormData();
    data.append("title", title);
    data.append("image", pic[0]);

    try {
      const response = await http.post(questionImagesRoute, data);
      console.log(response);

      this.setState({
        successfulImages: [...this.state.successfulImages, pic[0].name],
      });
      console.log(this.state.successfulImages);
    } catch (err) {
      console.log(err);
      if (err.response) {
        alert("Failed: " + err.response.data);

        this.setState({
          failedImages: {
            ...this.state.failedImages,
            [pic[0].name]: err.response.data,
          },
        });
        console.log(this.state.failedImages);
      }
    }
  };

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
      ? backendResults.scores.filter(({ question, similarity }) =>
          question.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : null;

    const ordered = _.orderBy(
      searchResults ? searchResults : backendResults.scores,
      [sortColumn.path],
      [sortColumn.order]
    );
    const results = paginate(ordered, currentPage, pageSize);

    return { totalCount: ordered.length, data: results };
  };

  render() {
    const {
      result,
      pageSize,
      currentPage,
      sortColumn,
      searchQuery,
    } = this.state;

    const { totalCount, data: results } = this.getPagedData();

    return (
      <div className="container-fluid m-5 ">
        <div className="row">
          <div className="col-sm">
            <div className="row justify-content-md-center">
              <h1> Store in Database </h1>
            </div>
            <form onSubmit={this.handleOnSubmit}>
              <ImageUploader
                withIcon={true}
                buttonText="Choose images"
                onChange={this.onDropDB}
                imgExtension={[".jpg", ".jpeg", ".png"]}
                label="Max file size: 5mb, accepted: jpg, png"
                maxFileSize={5242880}
                withPreview
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Button color="primary" type="submit">
                  Store in the database
                </Button>
              </div>
            </form>
          </div>

          <div className="col-sm">
            <div className="row justify-content-md-center">
              <h1> Test </h1>
            </div>
            <form onSubmit={this.handleOnSubmitTest}>
              <ImageUploader
                withIcon={true}
                buttonText="Choose images"
                onChange={this.onDropTest}
                imgExtension={[".jpg", ".png"]}
                label="Max file size: 5mb, accepted: jpg, png"
                maxFileSize={5242880}
                withPreview
                singleImage
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Button color="primary" type="submit">
                  Test
                </Button>
                <Button
                  color="primary"
                  style={{ margin: 5 }}
                  onClick={this.storeTestImageInDB}
                >
                  Store this in DB
                </Button>
              </div>
            </form>
          </div>
        </div>

        {result.extractedText ? (
          <React.Fragment>
            <div className="row m-5 pl-5">
              <h3>Extracted text: {result.extractedText}</h3>
            </div>
            <div className="row m-5 pl-5">
              <Search
                value={searchQuery}
                onChange={this.handleSearchChange}
              ></Search>
              <ResultsTable
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
            </div>
          </React.Fragment>
        ) : null}
      </div>
    );
  }
}
