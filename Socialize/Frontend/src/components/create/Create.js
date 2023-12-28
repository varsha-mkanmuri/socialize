import React, { useState } from "react";
import { InterestsList } from "../Utils";

var apigClientFactory = require("aws-api-gateway-client").default;

function Create(props) {
  const [formData, setFormData] = useState({
    category: "",
    name: "",
    description: "",
    poll: false,
  });

  const [hour, setHour] = useState("01");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("PM");

  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");

  const [category, setCategory] = useState(InterestsList[0]);
  const [categoryArray, setCategoryArray] = useState([]);

  const hours = Array.from({ length: 12 }, (_, index) =>
    String(index + 1).padStart(2, "0")
  );
  const minutes = Array.from({ length: 4 }, (_, index) =>
    String(index * 15).padStart(2, "0")
  );
  const periods = ["AM", "PM"];

  const handleChange = (event) => {
    var { name, value, type, checked } = event.target;
    name = event.target.id;
    value = type === "checkbox" ? checked : value;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (event) => {
    setDate(event.target.value);
  };

  const handleLocationChange = (event) => {
    setLocation(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    var uni = localStorage.getItem("uni");
    setLoading(true);

    var apigClient = apigClientFactory.newClient({
      invokeUrl: props.url,
    });

    var pathParams = {};
    var method = "POST";
    var hour_new = parseInt(hour);

    if (period === "PM") {
      hour_new = hour_new + 12;
    }
    var time = String(hour_new) + ":" + minute + ":00";

    if (formData.poll) {
      var pathTemplate = "/create/poll";
      var body = {
        title: formData.name,
        description: formData.description,
        date: date,
        time: time,
        location: location,
        category: formData.category,
        category_tag: categoryArray,
      };
      var additionalParams = {
        headers: { user_id: uni, "Content-Type": "application/json" },
        queryParams: {},
      };
      apigClient
        .invokeApi(pathParams, pathTemplate, method, additionalParams, body)
        .then(function (result) {
          setShowBanner(true);
          setLoading(false);
        })
        .catch(function (error) {
          console.log("Error:", error);
          setLoading(false);
        });
    } else {
      var pathTemplate = "/create/activity";

      var body = {
        title: formData.name,
        description: formData.description,
        date: date,
        time: time,
        location: location,
        category: formData.category,
        category_tag: categoryArray,
      };
      var additionalParams = {
        headers: { user_id: uni, "Content-Type": "application/json" },
        queryParams: {},
      };
      apigClient
        .invokeApi(pathParams, pathTemplate, method, additionalParams, body)
        .then(function (result) {
          setShowBanner(true);
          setLoading(false);
        })
        .catch(function (error) {
          console.log("Error:", error);
          setLoading(false);
        });
    }
  };

  const formattedDate = new Date().toISOString().split("T")[0];

  const handleCategoryChange = (value) => {
    setCategory(value);
  };

  const handleCategoryArrayChange = (event) => {
    event.preventDefault();

    if (category.trim() !== "") {
      var val = category.trim().replace(" ", "");
      if (categoryArray.includes(val) === false) {
        setCategoryArray([...categoryArray, val]);
        setCategory(InterestsList[0]);
      }
    }
  };

  const handleCategoryRemoval = (index) => {
    const updatedDaterray = [...categoryArray];
    updatedDaterray.splice(index, 1);
    setCategoryArray(updatedDaterray);
  };

  const CategoryComponent = () => {
    if (categoryArray !== null) {
      return categoryArray.map((item, index) => (
        <div className="col-sm-2" key={item}>
          <button
            className="btn btn-outline-secondary"
            onClick={() => handleCategoryRemoval(index)}
          >
            {item}{" "}
          </button>
        </div>
      ));
    } else return <></>;
  };
  const [showBanner, setShowBanner] = useState(false);

  const AlertComponenet = () => {
    if (showBanner)
      return (
        <div className="alert alert-success" role="alert">
          Created !!
        </div>
      );
    else return <></>;
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
    <div>
      <h1>Create</h1>
      <br />
      {AlertComponenet()}
      <form onSubmit={handleSubmit}>
        <div className="form-group row">
          <label htmlFor="category" className="col-2 col-form-label">
            Category
          </label>
          <div className="col-10">
            <select
              id="category"
              className="form-control"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value={null}>Choose...</option>
              <option value="Meetup">Meetup</option>
              <option value="Event">Event</option>
              <option value="Study Group">Study Group</option>
            </select>
          </div>
        </div>
        <br />
        <div className="form-group row">
          <label htmlFor="name" className="col-2 col-form-label">
            Name
          </label>
          <br />
          <div className="col-10">
            <input
              type="text"
              className="form-control"
              id="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter the name"
              required
            />
          </div>
        </div>
        <br />
        <div className="form-group row">
          <label htmlFor="description" className="col-2 col-form-label">
            Description
          </label>
          <br />
          <div className="col-10">
            <textarea
              className="form-control"
              id="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter description"
              required
            ></textarea>
          </div>
        </div>
        <br />
        <div className="form-group row">
          <label htmlFor="polls" className="col-2 col-form-label">
            Polls
          </label>
          <br />
          <div className="col-10">
            <input
              type="checkbox"
              className="form-control form-check-input"
              id="poll"
              checked={formData.poll}
              onChange={handleChange}
            />
            <p style={{ fontSize: "75%" }}>Check if this is a poll</p>
          </div>
        </div>
        <br />
        <div className="form-group row">
          <label htmlFor="time" className="col-2 col-form-label">
            Enter Time:
          </label>
          <div className="col-1">
            <select
              className="form-select"
              value={hour}
              onChange={(e) => setHour(e.target.value)}
            >
              {hours.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
          <div className="col-1">
            <select
              className="form-select"
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
            >
              {minutes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="col-2">
            <select
              className="form-select"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              {periods.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
        <br />
        <div className="form-group row">
          <label htmlFor="location " className="col-2 col-form-label">
            Location:
          </label>
          <div className="col-5">
            <input
              type="text"
              className="form-control"
              id="location"
              value={location}
              onChange={handleLocationChange}
              placeholder="e.g., Uris Hall"
            />
          </div>
        </div>
        <br />

        <div className="form-group row">
          <label htmlFor="date " className="col-2 col-form-label">
            Date:
          </label>
          <div className="col-5">
            <input
              type="date"
              className="form-control"
              id="date"
              value={date}
              onChange={handleDateChange}
              min={formattedDate}
            />
          </div>
        </div>
        <br />

        <div className="form-group row">
          <label htmlFor="category" className="col-2 col-form-label">
            Enter Tags:
          </label>
          <div className="col-6">
            <select
              className="form-select"
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              {InterestsList.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
          <div className="col-sm-2">
            <button
              className="btn btn-secondary"
              onClick={handleCategoryArrayChange}
            >
              Add
            </button>
          </div>
        </div>
        <br />
        <div className="row">
          <div className="col-2" />
          {CategoryComponent()}
        </div>
        {LoadingComponent()}
        <button type="submit" className="btn btn-primary">
          Create
        </button>
      </form>
      <br />
    </div>
  );
}

export default Create;
