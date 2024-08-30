import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import logo from "../imgs/logo.png";
import { useContext, useState, useRef, useEffect } from "react";
import { UserContext } from "../App";
import UserNavigationPanel from "./user-navigation.component";
import axios from "axios";

const Navbar = () => {
  const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);
  const [userNavPanel, setUserNavPanel] = useState(false);
  let {
    userAuth,
    setUserAuth,
    userAuth: { new_notification_available },
  } = useContext(UserContext);
  let { access_token = null, profile_img = null } = userAuth || {};
  let navigate = useNavigate();
  let location = useLocation();

  const inputRef = useRef(null);
  const searchBoxRef = useRef(null);

  useEffect(() => {
    if (access_token) {
      axios
        .get(`${import.meta.env.VITE_SERVER_DOMAIN}new-notification`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        })
        .then(({ data }) => {
          setUserAuth({ ...userAuth, ...data });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [access_token]);

  const handleUserNavpanel = () => {
    setUserNavPanel((currentVal) => !currentVal);
  };

  const handleDivClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSearchFunction = (e) => {
    let query = e.currentTarget.value;
    if (e.keyCode === 13) {
      navigate(`/search/${query}`);
      setSearchBoxVisibility(false);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setUserNavPanel(false);
    }, 200);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setSearchBoxVisibility(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  console.log(new_notification_available);
  return (
    <>
      <nav className="navbar z-50 sticky ">
        <Link to="/" className="flex-none w-20">
          <img src={logo} className="flex-none w-24" alt="Logo" />
        </Link>

        <div
          ref={searchBoxRef}
          className={`absolute bg-white left-0 top-full mt-0.5 py-4 px-[5vw] md:border-0 md:block w-full md:relative md:inset-0 md:p-0
            md:w-auto md:show ${searchBoxVisibility ? "show" : "hide"}`}
        >
          <div
            className="relative md:w-auto cursor-text"
            onClick={handleDivClick}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Search here"
              className="w-full md:w-auto bg-gray p-3 pl-6 pr-[12%]
            md:pr-6 rounded-full placeholder:text-dark-grey
            md:pl-12 border border-black"
              onKeyDown={handleSearchFunction}
            />
            <i className="fi fi-rr-search absolute right-4 top-1/2 transform -translate-y-1/2 text-xl text-gray-500 md:left-5"></i>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6 ml-auto">
          <button
            className="md:hidden bg-grey w-12 h-12 rounded-full flex items-center justify-center"
            onClick={() => {
              setSearchBoxVisibility((currentVal) => !currentVal);
            }}
          >
            <i className="fi fi-rr-search text-xl"></i>
          </button>
          <Link
            to="/editor"
            className="hidden md:flex gap-2 link color text-black"
          >
            <i className="fi fi-ss-file-edit"> </i>
            <p>write</p>
          </Link>

          {access_token ? (
            <>
              <Link to="dashboard/notifications">
                <button className="w-12 h-12 rounded-full bg-grey relative hover:bg-black/10">
                  <i className="fi fi-rr-bell text-2xl block mt-1">
                    {new_notification_available ? (
                      <span className="bg-red w-2 h-2 rounded-full absolute z-10 top-2 right-2"></span>
                    ) : (
                      ""
                    )}
                  </i>
                </button>
              </Link>

              <div
                className="relative"
                onClick={handleUserNavpanel}
                onBlur={handleBlur}
              >
                <button className="w-12 h-12 mt-1">
                  <img
                    src={profile_img}
                    className="w-full h-full object-cover rounded-full"
                    alt=""
                  />
                </button>
                {userNavPanel && <UserNavigationPanel />}
              </div>
            </>
          ) : (
            <>
              <Link className="btn-dark py-2" to="/signin">
                Sign In
              </Link>

              <Link className="btn-dark py-2 hidden md:block" to="/signup">
                Signup
              </Link>
            </>
          )}
        </div>
      </nav>

      <Outlet />
    </>
  );
};

export default Navbar;
