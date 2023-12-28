import { createBrowserRouter } from "react-router-dom";

import Home from "./home/Home";
import Event from "./event/Event";
import StudyGroup from "./studyGroup/StudyGroup";
import Create from "./create/Create";
import MeetUp from "./meetup/MeetUp";
import User from "./user/User";
import Specific from "./specific/Specific";
import Login from "./authentication/Login";
import Signup from "./authentication/Signup";
import Logout from "./authentication/Logout";
import ProfileEdit from "./user/ProfileEdit";
import CreateProfile from "./user/CreateProfile";
import SpecifcPoll from "./specific/SpecificPoll";

const URL = "https://n8rffxphe1.execute-api.us-east-1.amazonaws.com/dev";
//const URL = 'https://apple.com'

const routes = createBrowserRouter([
  {
    path: "/",
    element: <Home url={URL} />,
  },
  {
    path: "/event",
    element: <Event url={URL} />,
  },
  {
    path: "/studygroup",
    element: <StudyGroup url={URL} />,
  },
  {
    path: "/create",
    element: <Create url={URL} />,
  },
  {
    path: "/meetup",
    element: <MeetUp url={URL} />,
  },
  {
    path: "/user",
    element: <User url={URL} />,
  },
  {
    path: "/user/profile_edit",
    element: <ProfileEdit url={URL} />,
  },
  {
    path: "/specific",
    element: <Specific url={URL} />,
  },
  {
    path: "/pollSpecific",
    element: <SpecifcPoll url={URL} />,
  },
  {
    path: "/logout",
    element: <Logout url={URL} />,
  },
]);

const authenticationRoutes = createBrowserRouter([
  {
    path: "/",
    element: <Login url={URL} />,
  },
  {
    path: "/login",
    element: <Login url={URL} />,
  },
  {
    path: "/signup",
    element: <Signup url={URL} />,
  },
  {
    path: "/createprofile",
    element: <CreateProfile url={URL} />,
  },
  {
    path: "*",
    element: <Login url={URL} />,
  },
]);

export {routes, authenticationRoutes};
