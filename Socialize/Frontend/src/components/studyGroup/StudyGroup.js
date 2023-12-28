import React from "react";
import PersonalizeStudyGroup from "./PersonalizeStudyGroup";
import SearchComponent from "./SearchComponent";

function StudyGroup(props) {
  return (
    <div className="">
      <br />
      <h1>Study Group</h1>
      <hr />
      <SearchComponent url={props.url} />
      <br />
      <h5>Suggested for you</h5>
      <PersonalizeStudyGroup url={props.url} />
    </div>
  );
}

export default StudyGroup;
