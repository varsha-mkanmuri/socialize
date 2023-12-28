import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

import { RouterProvider } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";


import {routes, authenticationRoutes} from './components/Routes';

function App() {
  var authenticated = localStorage.getItem("isAuthenticated");
  if (authenticated) {
    var uni = localStorage.getItem("uni");
    return (
      <div className="App">
        <Navbar userName={uni} />
        <div className="container">
          <RouterProvider router={routes} />
        </div>
      </div>
    );
  } else {
    return (
      <div className="App">
        <RouterProvider router={authenticationRoutes} />
      </div>
    );
  }
}

export default App;
