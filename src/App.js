import React from "react";
import { Route, Redirect, Switch, BrowserRouter } from "react-router-dom";
import Upload from "./components/Upload";
import TestText from "./components/TestText";
import TestImage from "./components/TestImage";
import NavBar from "./components/navBar";
import "./App.css";

export default class App extends React.Component {
  render() {
    return (
      <React.Fragment>
        <BrowserRouter>
          <NavBar />
          <Switch>
            <Route path="/upload" component={Upload} />
            <Route path="/test_text" component={TestText} />
            <Route path="/test_image" component={TestImage} />
            <Redirect from="/" exact to="/upload" />
          </Switch>
        </BrowserRouter>
      </React.Fragment>
    );
  }
}
