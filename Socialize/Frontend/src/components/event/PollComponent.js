import React, { useState, useEffect } from "react";
import { PollingCards } from "../displayComponents/Cards";

var apigClientFactory = require("aws-api-gateway-client").default;

function PollComponent(props) {
  const [data, setData] = useState(null);

  useEffect(() => {
    var uni = localStorage.getItem("uni");
    var apigClient = apigClientFactory.newClient({ invokeUrl: props.url });
    var pathTemplate = "/poll/category";
    var pathParams = {};
    setLoading(true);
    var method = "GET";
    var body = {
      category: "Event",
      tag: props.tag,
    };
    var additionalParams = {
      headers: { user_id: uni, category: props.category },
      queryParams: {},
    };
    apigClient
      .invokeApi(pathParams, pathTemplate, method, additionalParams, body)
      .then(function (result) {
        setData(result.data.body);
        setLoading(false);
      })
      .catch(function (error) {
        setLoading(true);
        setData([
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
      });
  }, [props.url, props.tag]);

  function ScrollableCardRow({ children }) {
    return <div className="d-flex flex-nowrap overflow-auto">{children}</div>;
  }

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

  const Component = () => {
    if (data !== null) {
      return data.map((item) => (
        <PollingCards
          key={item.poll_id}
          pollingId={item.poll_id}
          title={item.title}
          numPeople={item.participants_count}
          type={item.category}
        />
      ));
    } else {
      if (loading === true) {
        return <></>;
      } else {
        return <>No Results Found</>;
      }
    }
  };

  return (
    <>
      {LoadingComponent()}
      <ScrollableCardRow>{Component()}</ScrollableCardRow>
    </>
  );
}
export default PollComponent;
