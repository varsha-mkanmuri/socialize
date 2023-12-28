import React, { useState, useEffect } from "react";
import { InterestsList } from "../Utils";

var apigClientFactory = require("aws-api-gateway-client").default;

function fetchUserDetails(setData, setInterestArray, url) {
  var uni = localStorage.getItem("uni");
  var apigClient = apigClientFactory.newClient({ invokeUrl: url });
  var pathTemplate = "/profile/view";
  var pathParams = {};
  var method = "GET";
  var body = {};
  var additionalParams = { headers: { user_id: uni }, queryParams: {} };
  apigClient
    .invokeApi(pathParams, pathTemplate, method, additionalParams, body)
    .then(function (result) {
      var res = result.data.body;
      setData({
        name: res.name,
        location: res.location,
        uni: res.uni,
        phoneNum: res.phoneno,
        emailid: res.emailId,
      });
      setInterestArray(res.interest);
    })
    .catch(function (error) {
      console.log("Error:", error);
    });
}

function ProfileEdit(props) {
  var [data, setData] = useState({
    name: "",
    uni: "",
    emailid: "",
    location: "",
    phoneNum: "",
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
        <div className="col-sm-3" key={item}>
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

  const handleLocationChange = (event) => {
    setData({ ...data, location: event.target.value });
  };
  const handlePhonenumChange = (event) => {
    setData({ ...data, phoneNum: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    var uni = localStorage.getItem("uni");
    var apigClient = apigClientFactory.newClient({ invokeUrl: props.url });
    var pathTemplate = "/profile/update";
    var pathParams = {};
    var method = "PUT";
    setLoading(true);
    var body = {
      location: data.location,
      phoneno: data.phoneNum,
      interest: interestArray,
    };
    var additionalParams = { headers: { user_id: uni }, queryParams: {} };
    apigClient
      .invokeApi(pathParams, pathTemplate, method, additionalParams, body)
      .then(function (result) {
        localStorage.setItem("interest", interestArray);
        setLoading(false);
        window.location.href = "/user";
      })
      .catch(function (error) {
        console.log("Error:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUserDetails(setData, setInterestArray, props.url, setLoading);
  }, [props.url]);

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
      <div className="">
        <br />
        <h1>Edit Profile</h1>
        <br />
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
                disabled
                value={data.name}
                readOnly
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
                value={data.emailid}
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
                value={data.phoneNum}
                onChange={handlePhonenumChange}
                required
              />
            </div>
          </div>
          <br />
          <div className="form-group row">
            <label className="col-sm-2 col-form-label" htmlFor="interests">
              Interests:
            </label>
            <div className="col-sm-8">
              <select
                className="form-select"
                id="interests"
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
            <div className="col-10">
              <div className="row">{InterestComponent()}</div>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            Edit
          </button>
          {LoadingComponent()}
        </form>
      </div>
    </>
  );
}
export default ProfileEdit;
