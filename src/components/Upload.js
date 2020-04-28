import React from "react";
import _ from "lodash";
import { Button } from "reactstrap";
import ImageUploader from "react-images-upload";
import http from "../services/httpServices";

const questionImagesRoute = "http://localhost:8000/api/questionImages";
// const questionImagesRoute = "http://139.59.68.43:8000/api/questionImages";

export default class Upload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      successfulImages: [],
      failedImages: [],
      pictures: [],
    };
    this.onDropDB = this.onDropDB.bind(this);
    this.handleOnSubmit = this.handleOnSubmit.bind(this);
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

  render() {
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
      </div>
    );
  }
}
