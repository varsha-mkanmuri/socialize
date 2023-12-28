import React from "react";
import InterestComponent from "./InterestComponent";
import PollComponent from "./PollComponent";
import PersonalizeMeetup from "./PersonalizeMeetup";
import SearchComponent from "./SearchComponent";

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function MeetUp(props) {
  var interest_list = localStorage.getItem("interest").split(",");
  var interest_ = interest_list[getRandomInt(interest_list.length)];

  return (
    <div className="">
      <br />
      <h1>Meetup</h1>
      <hr />
      <SearchComponent url={props.url} />
      <br />
      <hr />
      <h5>Suggested for you</h5>
      <PersonalizeMeetup url={props.url} />
      <br />
      <h5>
        Because you are interested in <span>{interest_}</span>
      </h5>
      <InterestComponent url={props.url} tag={interest_} />
      <br />
      <h5>Currently Polling</h5>
      {<PollComponent url={props.url} category = 'Meetup'/>}
    </div>
  );
}

export default MeetUp;
