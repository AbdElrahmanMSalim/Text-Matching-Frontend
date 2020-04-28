import React from "react";
import _ from "lodash";
import { Button } from "reactstrap";
import ImageUploader from "react-images-upload";
import Search from "./Search";
import Pagination from "./Pagination";
import ResultsTable from "./ResultsTable";
import { paginate } from "../utils/paginate";
import http from "../services/httpServices";

const testTextRoute = "http://139.59.68.43:8000/api/testText";
const questionImagesRoute = "http://139.59.68.43:8000/api/questionImages";
//139.59.68.43

export default class TestText extends React.Component {
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
    this.onDropTest = this.onDropTest.bind(this);
    this.handleOnSubmitTest = this.handleOnSubmitTest.bind(this);
  }

  onDropTest(picture) {
    this.setState({
      testPicture: picture,
    });
  }

  async handleOnSubmitTest(e) {
    e.preventDefault();

    const pic = this.state.testPicture[0];
    if (!pic) return alert("No test pictures attached");
    const title = pic.size + "-" + pic.name;

    const data = new FormData();
    data.append("title", title);
    data.append("testImage", this.state.testPicture[0]);

    try {
      const response = await http.post(testTextRoute, data);

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

      alert("Success");
      this.setState({
        successfulImages: [...this.state.successfulImages, pic[0].name],
      });
    } catch (err) {
      console.log(err);
      if (err.response) {
        alert("Failed: " + err.response.data);

        this.setState({
          failedImages: [
            ...this.state.failedImages,
            { name: title, error: err.response.data },
          ],
        });
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
    console.log(this.state.successfulImages);
    console.log(this.state.failedImages);

    return (
      <div className="container-fluid m-5 ">
        <div className="col-sm ">
          <div className="row justify-content-md-center m-2">
            <h1> Test Text</h1>
          </div>
          <form onSubmit={this.handleOnSubmitTest}>
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
          </form>
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

        {result.extractedText ? (
          <React.Fragment>
            <div className="row m-5 pl-5">
              <h5>Extracted text: {result.extractedText}</h5>
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
