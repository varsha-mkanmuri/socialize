import React from "react";
import "./cards.css";

export const Cards = (props) => {
  var num = props.numPeople ? props.numPeople : 0;
  return (
    <div className="card col-3">
      <div className="card-body text-center">
        <h5 className="card-title">{props.title}</h5>
        <div className="card-text">
          <div className="row">
            <div className="col-6">
              <i className="fa-regular fa-clock" /> {props.time}
            </div>
            <div className="col-6">
              <i className="fa-solid fa-location-dot" /> {props.location}
            </div>
          </div>
          <br />
          <div className="row">
            <div className="col-6">
              <i className="fa-solid fa-users" /> {num} people
            </div>
            <div className="col-6">{props.type}</div>
          </div>
        </div>
        <br />
        <a
          href={"/specific?id=" + props.cardId + "&type=" + props.type}
          className="btn btn-outline-dark"
        >
          {props.title}
        </a>
      </div>
    </div>
  );
};

export const PollingCards = (props) => {
  var num = props.numPeople ? props.numPeople : 0;
  return (
    <div className="card col-3">
      <div className="card-body text-center">
        <h5 className="card-title">{props.title}</h5>
        <div className="card-text" style={{ textAlign: "center" }}>
          <div className="row">
            <i className="fa-solid fa-users" />
            <p>{num} people</p>
            <p>{props.type}</p>
          </div>
        </div>
        <a
          href={
            "/pollSpecific?id=" + props.pollingId + "&type=" + props.type
          }
          className="btn btn-outline-dark"
        >
          {props.title}
        </a>
      </div>
    </div>
  );
};
