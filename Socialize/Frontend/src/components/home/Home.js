import React, { useState, useEffect } from "react";
import { Cards, PollingCards } from "../displayComponents/Cards";

var apigClientFactory = require("aws-api-gateway-client").default;

function ScrollableCardRow({ children }) {
  return <div className="d-flex flex-nowrap overflow-auto">{children}</div>;
}

function Home(props) {
  const [upcoming, setUpcoming] = useState(null);
  const [polls, setPolls] = useState(null);
  const [activities, setActivities] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    var uni = localStorage.getItem("uni");
    setLoading(true);
    var apigClient = apigClientFactory.newClient({ invokeUrl: props.url });
    var pathTemplate = "/homepage";
    var pathParams = {};
    var method = "GET";
    var body = {};
    var additionalParams = { headers: { user_id: uni }, queryParams: {} };
    apigClient
      .invokeApi(pathParams, pathTemplate, method, additionalParams, body)
      .then(function (result) {
        if (result.data.body) {
          setUpcoming(result.data.body.upcoming);
          setActivities(result.data.body["activities_created"]);
          setPolls(result.data.body["polls"]);
        }else{
          setUpcoming([]);
          setActivities([]);
          setPolls([]);
        }
        setLoading(false);
      })
      .catch(function (error) {
        setUpcoming([
          {
            id: "12rkjbnacijld",
            title: "AWS System Design",
            img_url:
              "https://d1yjjnpx0p53s8.cloudfront.net/styles/logo-thumbnail/s3/102017/logo_0.png?17TK91b1B6OvV2MFrCLfukw1c8oEaNr6&itok=vsanFiUj",
            location: "Uris Hall",
            datetime: "6:30 pm",
            attendees: ["1", "2"],
            category: "Event",
          },
        ]);
        console.log(error);
        setLoading(false);
      });
  }, [props.url]);

  const UpcomingComponent = () => {
    if (upcoming !== null) {
      if (upcoming.length > 0) {
        return upcoming.map((item) => (
          <Cards
            key={item.activity_id}
            cardId={item.activity_id}
            title={item.title}
            img_url={item.img_url}
            location={item.location}
            time={item.datetime}
            numPeople={item.attendees.length}
            type={item.category}
          />
        ));
      } else return <>No Upcoming Activity Found</>;
    } else return <></>;
  };

  const AcitivitiesComponent = () => {
    if (activities !== null) {
      if (activities.length > 0) {
        return activities.map((item) => (
          <Cards
            key={item.activity_id}
            cardId={item.activity_id}
            title={item.title}
            img_url={item.img_url}
            location={item.location}
            time={item.datetime}
            numPeople={item.attendees.length}
            type={item.category}
          />
        ));
      } else {
        return <>No Activities Found</>;
      }
    } else return <></>;
  };

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

  const PollsComponent = () => {
    console.log(polls)
    if (polls !== null) {
      if (polls.length > 0) {
        return polls.map((item) => (
          <PollingCards
            key={item.poll_id}
            pollingId={item.poll_id}
            title={item.title}
            numPeople={item.participants_count}
            type={item.category}
          />
        ));
      } else return <>No Polls Found</>;
    } else return <></>;
  };

  return (
    <>
      <br />
      <h1>Homepage</h1>
      <hr />
      <h5>Upcoming</h5>
      You have registered for these 
      <br />
      {LoadingComponent()}
      <ScrollableCardRow>{UpcomingComponent()}</ScrollableCardRow>
      <br />
      <h5>Created by you</h5>
      {LoadingComponent()}
      <ScrollableCardRow>{AcitivitiesComponent()}</ScrollableCardRow>
      <br />
      <h5>Your Polls</h5>
      Polls created by you
      {LoadingComponent()}
      <ScrollableCardRow>{PollsComponent()}</ScrollableCardRow>
    </>
  );
}

export default Home;
