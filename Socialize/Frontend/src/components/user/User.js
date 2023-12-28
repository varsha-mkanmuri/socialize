import React, {useState, useEffect} from "react";
import "./user.css";
import { Link } from "react-router-dom";

var apigClientFactory = require("aws-api-gateway-client").default;

function fetchUserDetails(setData, url, setLoading) {
  var uni = localStorage.getItem("uni");
  var apigClient = apigClientFactory.newClient({ invokeUrl: url });
  var pathTemplate = "/profile/view";
  var pathParams = {};
  var method = "GET";
  var body = { };
  setLoading(true);
  var additionalParams = { headers: { user_id: uni }, queryParams: {} };
  apigClient
    .invokeApi(pathParams, pathTemplate, method, additionalParams, body)
    .then(function (result) {
      var res = result.data.body
      console.log(result.data)
      setLoading(false);
      setData({
        'name' : res.name, 
        'location' :res.location,
        'uni' : res.uni,
        'phoneNum' : res.phoneno,
        'interests' : res.interest,
        'emailid' :res.emailId 
      })
      
    })
    .catch(function (error) {
      console.log("Error:", error);
      setLoading(false);
    });
}

function User(props) {
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

  var [data, setData] = useState({
    name: "",
    uni: "",
    emailid: "",
    location: "",
    phoneNum: "",
    interests: ['']
  })

  useEffect(() => {
    fetchUserDetails(setData, props.url, setLoading);
  }, [props.url]);

  return (
    <div className="">
      <br />
      <h1>Profile</h1>
      {LoadingComponent()}
      <br />
      <div className="row detail">
        <div className="col-2"><b>Name</b> </div>
        <div className="col-3">{data.name}</div>
      </div>
      <div className="row detail">
        <div className="col-2"><b>Uni</b></div>
        <div className="col-3">{data.uni}</div>
      </div>
      <div className="row detail">
        <div className="col-2"><b>Email ID</b></div>
        <div className="col-3">{data.emailid}</div>
      </div>
      <div className="row detail"> 
        <div className="col-2"><b>Location</b></div>
        <div className="col-3">{data.location}</div>
      </div>
      <div className="row detail">
        <div className="col-2"> <b>Phone Num</b> </div>
        <div className="col-3">{data.phoneNum}</div>
      </div>
      <div className="row detail">
        <div className="col-2"> <b>Interest</b> </div>
        <div className="col-4" id="interests">{data.interests.map((interest, index) => (
        <button type='button' className="btn btn-outline-secondary" style={{marginRight:"5px"}}key={index}>{interest}</button>
      ))}</div>
      </div>
      <Link to="/user/profile_edit"><button type="button" className="btn btn-primary">Edit</button></Link>
    </div>
  );
}

export default User;
