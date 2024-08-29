import AnimationWrapper from "../common/page-animation";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../App";
import { removeFromSession } from "../common/session";

const UserNavigationPanel = () => {
  const { userAuth, setUserAuth } = useContext(UserContext);
  const username = userAuth ? userAuth.username : null;
  const navigate = useNavigate();

  const signOutUser = () => {
    removeFromSession("user");
    setUserAuth({ access_token: null });
    navigate("/");
  };
  return (
    <AnimationWrapper
      className="absolute right-0 z-20"
      transition={{ duration: 0.2 }}
    >
      <div
        className="bg-white absolute right-0 border border-grey
       w-60  duration-200"
      >
        <Link to="/editor" className="flex-gap-2 link  pl-8 py-4">
          <i className="fi fi-rr-file-edit"></i> write
        </Link>

        <Link to={`/user/${username}`} className="flex-gap-2 link  pl-8 py-4">
          Profile
        </Link>

        <Link to={"dashboard/blogs"} className="flex-gap-2 link pl-8 py-4">
          Dashbord
        </Link>

        <Link
          to={"settings/edit-profile"}
          className="flex-gap-2 link pl-8 py-4"
        >
          Settings
        </Link>

        <span className="absolute border-t border-grey  w-[100%]"></span>

        <button
          className="text-left p-4 hover:bg-grey w-full pl-8 py-4"
          onClick={signOutUser}
        >
          <h1 className="font-bold text-xl mg-1">Sign Out</h1>
          <p className="text-dark-grey">@{username}</p>
        </button>
      </div>
    </AnimationWrapper>
  );
};

export default UserNavigationPanel;
