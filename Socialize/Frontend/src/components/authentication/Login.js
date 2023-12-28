import React, { useState } from "react";
import { Link } from "react-router-dom";

import backgroundImage from '../../campus.jpg';
import "./authentication.css";
import logo from "../../logo.svg";

var apigClientFactory = require("aws-api-gateway-client").default;

function Login(props) {
  const styles = {
    backgroundImage: `url(${backgroundImage})`,
    height: '100vh',
    padding: '0',
    margin: '0',
    imageRendering: 'crisp-edges',
    imageRendering: 'auto',
    backgroundSize: 'cover', 
    backgroundPosition: 'center',
    opacity: '1',
  };

  const [uni, setUni] = useState("");
  const [password, setPassword] = useState("");

  const handleUniChange = (event) => {
    setUni(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    var apigClient = apigClientFactory.newClient({ invokeUrl: props.url });
    var pathTemplate = "/auth/login";
    var pathParams = {};
    var method = "GET";
    var body = {};
    setLoading(true);
    var additionalParams = { headers: { uni: uni, password : password }, queryParams: {} };
    apigClient
      .invokeApi(pathParams, pathTemplate, method, additionalParams, body)
      .then(function (result) {
        var response = result.data.body

        if(response["present"] === true){
          localStorage.setItem("uni", uni);
          localStorage.setItem("isAuthenticated", true);
          localStorage.setItem("name", response.user.name);
          localStorage.setItem("interest", response.user.interest);
          window.location.href = "/";
          setLoading(false);
        }
        else{
          alert(response['err'])
          setLoading(false);
        }
      })
      .catch(function (error) {
        console.log(error);
        setLoading(false);
      });
  };

  const [loading, setLoading] = useState(false);
  const LoadingComponent = () => {
    if (loading) {
      return (
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      );
    } else {
      return <></>;
    }
  };

  return (
    <>
      <div className="row">
        <div
          className="col-8"
          style={styles}
        ></div>
        <div className="col-4 d-flex align-items-center justify-content-center">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <img className="logo" src={logo} alt="columbia"/>
            </div>
            <div className="row">
              <div className="form-group">
                <label htmlFor="uni">Uni:</label>
                <input
                  type="text"
                  className="form-control"
                  id="uni"
                  value={uni}
                  onChange={handleUniChange}
                  required
                />
              </div>
            </div>
            <br />
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                className="form-control"
                id="password"
                value={password}
                onChange={handlePasswordChange}
                required
              />
            </div>
            {LoadingComponent()}
            <br />
            <div className="row" style={{ textAlign: "center" }}>
              <button type="submit" className="btn btn-primary">
                Login
              </button>
            </div>
            <br />
            <br />
            <div className="row">New user ?</div>
            <div className="row">
              <Link to="/signup" className="btn btn-primary">
                Sign Up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
export default Login;
