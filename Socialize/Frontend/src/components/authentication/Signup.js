import React, { useState } from "react";
import { Link } from "react-router-dom";

import backgroundImage from '../../campus.jpg';
import "./authentication.css";
import logo from "../../logo.svg";

var apigClientFactory = require("aws-api-gateway-client").default;

function Signup(props) {
  const [data, setData] = useState({
    uni: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
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

  const [showBanner, setShowBanner] = useState(false);
  const handleChange = (event) => {
    var { name, value } = event.target;
    name = event.target.id;
    setData({ ...data, [name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const isColumbiaEmail = data.email.endsWith("@columbia.edu");
    if (isColumbiaEmail === false) {
      alert(
        "Please provide your columbia email id that ends with @columbia.edu"
      );
    } else if (data.password !== data.confirmPassword) {
      alert("Password and cofirm password does not match");
    } else {
      var apigClient = apigClientFactory.newClient({ invokeUrl: props.url });
      var pathTemplate = "/auth/signup";
      var pathParams = {};
      var method = "POST";
      var body = {};
      var additionalParams = {
        headers: {
          uni: data.uni,
          emailid: data.email,
          password: data.password,
        },
        queryParams: {},
      };
      apigClient
        .invokeApi(pathParams, pathTemplate, method, additionalParams, body)
        .then(function (result) {
          var response = JSON.parse(result.data.body);

          localStorage.setItem("uni", data.uni);
          localStorage.setItem("email", data.email);
          setShowBanner(true);
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  };
  const AlertComponenet = () => {
    if (showBanner)
      return (
        <div className="alert alert-success" role="alert">
          {" "}
          Please check your email for verification{" "}
        </div>
      );
    else return <></>;
  };
  return (
    <>
      <div className="row">
        <div
          className="col-8 login-image-container"
          style={styles}
        ></div>

        <div className="col-4 d-flex align-items-center justify-content-center">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <img className="logo" src={logo} alt="columbia" />
            </div>
            <div className="row">
              <div className="col-8 offset-2">{AlertComponenet()}</div>
            </div>
            <div className="row">
              <div className="form-group">
                <label htmlFor="uni">Uni:</label>
                <input
                  type="text"
                  className="form-control"
                  id="uni"
                  value={data.uni}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <br />

            <div className="row">
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={data.email}
                  onChange={handleChange}
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
                value={data.password}
                onChange={handleChange}
                required
              />
            </div>
            <br />
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password:</label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                value={data.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <br />
            <div className="row" style={{ textAlign: "center" }}>
              <button type="submit" className="btn btn-primary">
                Sign up
              </button>
            </div>
            <br />
            <br />
            <div className="row">Already a user ?</div>
            <div className="row">
              <Link to="/login" className="btn btn-primary">
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
export default Signup;
