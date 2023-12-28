import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { InterestsList } from "../Utils";

var apigClientFactory = require("aws-api-gateway-client").default;

function CreateProfile(props) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const uni = queryParams.get("uni");
  const email = queryParams.get("email");

  const [showBanner, setShowBanner] = useState(true);
  const [bannerVal, setBannerVal] = useState("Complete your profile for verification");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowBanner(false);
    }, 7500);

    return () => clearTimeout(timeout);
  }, []);

  var [data, setData] = useState({
    name: "",
    email: email,
    uni: uni,
    location: "",
    phoneno: "",
  });

  const [interest, setInterest] = useState(InterestsList[0]);
  const [interestArray, setInterestArray] = useState([]);

  const handleInterestRemoval = (index) => {
    const updatedDaterray = [...interestArray];
    updatedDaterray.splice(index, 1);
    setInterestArray(updatedDaterray);
  };
  const handleInterestChange = (value) => {
    setInterest(value);
  };

  const handleInterestArray = (event) => {
    event.preventDefault();

    if (interest.trim() !== "") {
      var val = interest.trim().replace(" ", "");
      if (interestArray.includes(val) === false) {
        setInterestArray([...interestArray, val]);
        setInterest(InterestsList[0]);
      }
    }
  };

  const InterestComponent = () => {
    if (interestArray !== null) {
      return interestArray.map((item, index) => (
        <div className="col-sm-2" key={item}>
          <button
            className="btn btn-outline-secondary"
            onClick={() => handleInterestRemoval(index)}
          >
            {item}{" "}
          </button>
        </div>
      ));
    } else return <></>;
  };
  
  const AlertComponent = () => {
    if (showBanner) return <div className="alert alert-success" role='alert'> {bannerVal} </div>;
    else return <></>;
  };

  const handleLocationChange = (event) => {
    setData({ ...data, location: event.target.value });
  };
  const handlePhonenumChange = (event) => {
    setData({ ...data, phoneno: event.target.value });
  };
  const handleNameChange = (event) => {
    setData({ ...data, name: event.target.value });
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    var apigClient = apigClientFactory.newClient({ invokeUrl: props.url });
    var pathTemplate = "/profile/create";
    var pathParams = {};
    var method = "POST";
    var body = {
      name: data.name,
      uni: data.uni,
      emailid: data.email,
      location: data.location,
      phoneno: data.phoneno,
      interest: interestArray,
    };
    var additionalParams = { headers: { uni: uni }, queryParams: {} };
    apigClient
      .invokeApi(pathParams, pathTemplate, method, additionalParams, body)
      .then(function (result) {
        setShowBanner(true)
        setBannerVal('Profile has been created')
      })
      .catch(function (error) {
        console.log("Error:", error);
      });
  };

  return (
    <div className="container">
      <br />
      <h1>Create Profile</h1>
      {AlertComponent()}
      <form onSubmit={handleSubmit}>
        <div className="form-group row">
          <label className="col-sm-2 col-form-label" htmlFor="name">
            Name:
          </label>
          <div className="col-sm-10">
            <input
              type="text"
              className="form-control"
              id="name"
              value={data.name}
              onChange={handleNameChange}
              required
            />
          </div>
        </div>
        <br />
        <div className="form-group row">
          <label className="col-sm-2 col-form-label" htmlFor="uni">
            Uni :
          </label>
          <div className="col-sm-10">
            <input
              type="text"
              className="form-control"
              value={data.uni}
              id="uni"
              disabled
              readOnly
            />
          </div>
        </div>
        <br />
        <div className="form-group row">
          <label className="col-sm-2 col-form-label" htmlFor="email">
            Email:
          </label>
          <div className="col-sm-10">
            <input
              type="email"
              className="form-control"
              id="email"
              disabled
              value={data.email}
              readOnly
            />
          </div>
        </div>
        <br />
        <div className="form-group row">
          <label className="col-sm-2 col-form-label" htmlFor="location">
            Location:
          </label>
          <div className="col-sm-10">
            <input
              type="text"
              className="form-control"
              id="location"
              value={data.location}
              onChange={handleLocationChange}
              required
            />
          </div>
        </div>
        <br />
        <div className="form-group row">
          <label className="col-sm-2 col-form-label" htmlFor="phoneNum">
            Phone Number:
          </label>
          <div className="col-sm-10">
            <input
              type="tel"
              className="form-control"
              id="phoneNum"
              value={data.phoneno}
              onChange={handlePhonenumChange}
              required
            />
          </div>
        </div>
        <br />

        <div className="form-group row">
          <label htmlFor="interest" className="col-2 col-form-label">
            Enter Time:
          </label>
          <div className="col-6">
            <select
              className="form-select"
              value={interest}
              onChange={(e) => handleInterestChange(e.target.value)}
            >
              {InterestsList.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
          <div className="col-sm-2">
            <button className="btn btn-primary" onClick={handleInterestArray}>
              Add
            </button>
          </div>
        </div>
        <br />
        <div className="row">
          <div className="col-2" />
          {InterestComponent()}
        </div>

        <button type="submit" className="btn btn-primary">
          Create
        </button>
      </form>
    </div>
  );
}
export default CreateProfile;
