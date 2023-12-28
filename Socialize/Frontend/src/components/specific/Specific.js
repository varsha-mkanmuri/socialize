import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

var apigClientFactory = require("aws-api-gateway-client").default;
function register(activity_id, url, setRegisterLoading, setShowBanner) {
  var uni = localStorage.getItem("uni");
  var apigClient = apigClientFactory.newClient({ invokeUrl: url });
  var pathTemplate = "/activity/register";
  var pathParams = {};
  var method = "POST";
  setRegisterLoading(true);
  setShowBanner(false);
  var body = {
    activity_id: activity_id,
  };
  var additionalParams = { headers: { user_id: uni }, queryParams: {} };
  apigClient
    .invokeApi(pathParams, pathTemplate, method, additionalParams, body)
    .then(function (result) {
      setRegisterLoading(false);
      setShowBanner(true);
    })
    .catch(function (error) {
      console.log("Error:", error);
      setRegisterLoading(false);
    });
}

function getData(type, id, setDetails, url, setLoading) {
  var uni = localStorage.getItem("uni");
  var apigClient = apigClientFactory.newClient({ invokeUrl: url });
  type = type.toLowerCase();
  var pathTemplate = "/activity/" + id;
  var pathParams = {};
  var method = "GET";
  var body = {};
  var additionalParams = { headers: { user_id: uni }, queryParams: {} };
  setLoading(true);
  apigClient
    .invokeApi(pathParams, pathTemplate, method, additionalParams, body)
    .then(function (result) {
      if (result.data.body) {
        //console.log(result.data.body);
        setDetails(result.data.body);
      }

      setLoading(false);
    })
    .catch(function (error) {
      console.log(error);
      setLoading(false);
    });
  setDetails([
    {
      id: "12rkjbnacijld",
      title: "AWS System Design",
      img_url:
        "https://d1yjjnpx0p53s8.cloudfront.net/styles/logo-thumbnail/s3/102017/logo_0.png?17TK91b1B6OvV2MFrCLfukw1c8oEaNr6&itok=vsanFiUj",
      location: "Uris Hall",
      time: "6:30 pm",
      numPeople: 2,
      type: "Meetup",
      tags: ["Tech"],
    },
  ]);
}

function Specifc(props) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id");
  const type = queryParams.get("type");

  const [details, setDetails] = useState({
    attendees: [],
    title: null,
    tags: [],
  });
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    getData(type, id, setDetails, props.url, setLoading);
  }, [props.url, type, id]);

  const [loading, setLoading] = useState(false);
  const [resgisterLoading, setRegisterLoading] = useState(false);

  const LoadingComponent = () => {
    if (resgisterLoading) {
      return (
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      );
    } else {
      return <></>;
    }
  };

  const AlertComponenet = () => {
    if (showBanner)
      return (
        <div className="alert alert-success" role="alert">
          You have been registered
        </div>
      );
    else return <></>;
  };

  const ShowTags = () => {
    if (details.tags) {
      return (
        <div className="row">
          <div className="col-1">
            {" "}
            <b>Tags :</b>
          </div>
          <div className="col-10">
            <div className="row">
              {details["tags"].map((i) => (
                <div className="col-3" key={i} value={i}>
                  <button className="btn btn-outline-secondary">{i}</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="spinner-border" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    );
  } else {
    return (
      <div>
        <br />
        <div className="row align-items-center">
          <div className="col-4 offset-1 text-center">
            <h2>{details.title}</h2>
            <div className="row ">
              <div className="col-6">
                <i className="fa-regular fa-clock" /> {details.datetime}
              </div>
              <div className="col-6">
                <i className="fa-solid fa-location-dot" /> {details.location}
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <i className="fa-solid fa-users" /> {details.attendees.length}
              </div>
            </div>

            <br />
          </div>
          <div className="col-2 offset-4 ">
            <button
              className="btn btn-primary"
              onClick={() =>
                register(id, props.url, setRegisterLoading, setShowBanner)
              }
            >
              {LoadingComponent()}
              Register
            </button>
          </div>
        </div>
        <br />
        {AlertComponenet()}
        <br />
        {ShowTags()}
        <br />
        <div className="row">
          <h2>Details</h2>
          <hr />
          {details.description}
        </div>
        <br />
      </div>
    );
  }
}

export default Specifc;
