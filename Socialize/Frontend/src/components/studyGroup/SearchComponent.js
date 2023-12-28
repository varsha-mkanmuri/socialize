import React, { useState } from "react";
import { Cards } from "../displayComponents/Cards";
var apigClientFactory = require("aws-api-gateway-client").default;

function SearchComponent(props) {
  const [text, setText] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    var uni = localStorage.getItem("uni");
    var apigClient = apigClientFactory.newClient({ invokeUrl: props.url });
    var pathTemplate = "/activity/search";
    var pathParams = {};
    var method = "GET";
    var body = {};
    setLoading(true);
    var additionalParams = {
      headers: { user_id: uni },
      queryParams: {
        search_query: text,
        category: "Study Group",
      },
    };
    apigClient
      .invokeApi(pathParams, pathTemplate, method, additionalParams, body)
      .then(function (result) {
        if (result.data.results.length > 0) {
          setData(result.data.results);
        } else {
          setData(null);
        }
        setLoading(false);
      })
      .catch(function (error) {
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
        console.log(error);
        setLoading(false);
      });
  };

  const Component = () => {
    if (data !== null) {
      return data.map((item) => (
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
    } else return <></>;
  };

  function ScrollableCardRow({ children }) {
    return <div className="d-flex flex-nowrap overflow-auto">{children}</div>;
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="form-group row">
          <div className="col-sm-10">
            <input
              type="text"
              className="form-control"
              id="name"
              value={text}
              onChange={handleTextChange}
              required
            />
          </div>
          <div className="col-sm-2">
            <button className="btn btn-primary" type="submit">
              Search
            </button>
          </div>
        </div>
      </form>
      {loading && (
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      )}
      <ScrollableCardRow>{Component()}</ScrollableCardRow>
    </>
  );
}
export default SearchComponent;
