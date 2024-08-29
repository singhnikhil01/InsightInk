import { useContext, useState, useRef, useEffect } from "react";
import { Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { UserContext } from "../App";

const SideNav = () => {
  const {
    userAuth: { access_token },
  } = useContext(UserContext);

  const location = useLocation();
  let page = location.pathname.split("/")[2] || "dashboard";
  const [pageState, setPageState] = useState(page.replace("-", ""));
  const [showSideNav, setShowSideNav] = useState(false);
  const activeTabLine = useRef(null);
  const sideBarIconTab = useRef(null);
  const pageStateTab = useRef(null);

  useEffect(() => {
    setShowSideNav(false);
    pageStateTab.current?.click();
  }, [pageState]);

  const changePageState = (e) => {
    const { offsetWidth, offsetLeft } = e.target;
    if (activeTabLine.current) {
      activeTabLine.current.style.width = `${offsetWidth}px`;
      activeTabLine.current.style.left = `${offsetLeft}px`;
    }

    if (e.target === sideBarIconTab.current) {
      setShowSideNav(!showSideNav);
    } else {
      setPageState(e.target.innerText.toLowerCase());
      setShowSideNav(false);
    }
  };

  if (!access_token) {
    return <Navigate to="/signin" />;
  }

  return (
    <section className="relative flex gap-10 py-0 m-0 max-md:flex-col">
      <div className="sticky top-[80px] z-40">
        <div className="md:hidden bg-white py-1 border-b border-grey flex flex-nowrap overflow-x-auto relative">
          <button
            ref={sideBarIconTab}
            className="p-5 capitalize"
            onClick={changePageState}
          >
            <i className="fi fi-rr-bars-staggered pointer-events-none"></i>
          </button>
          <button
            ref={pageStateTab}
            className="p-5 capitalize"
            onClick={changePageState}
          >
            {pageState}
          </button>
          <hr
            ref={activeTabLine}
            className="absolute bottom-0 left-0  bg-black duration-500"
          />
        </div>
        <div
          className={`min-w-[200px] h-[calc(100vh-80px-60px)] md:h-auto md:sticky top-24 overflow-y-auto p-6 md:pr-0 md:border-grey md:border-r absolute max-md:top-[64px] bg-white max-md:w-[calc(100%)] max-md:px-16 max-md:-ml-7 duration-500 z-20 ${
            showSideNav
              ? "max-md:opacity-100 max-md:pointer-events-auto"
              : "max-md:opacity-0 max-md:pointer-events-none"
          }`}
        >
          <h1 className="text-xl text-dark-grey mb-3">Dashboard</h1>
          <hr className="border-grey -ml-6 mb-8 mr-6" />
          <NavLink
            to="/dashboard/blogs"
            onClick={changePageState}
            className="sidebar-link"
          >
            <i className="fi fi-rr-document"></i>
            Blogs
          </NavLink>
          <NavLink
            to="/dashboard/notifications"
            onClick={changePageState}
            className="sidebar-link"
          >
            <i className="fi fi-rr-bell"></i>
            Notifications
          </NavLink>
          <NavLink
            to="/editor"
            onClick={changePageState}
            className="sidebar-link"
          >
            <i className="fi fi-rr-file-edit"></i>
            Write
          </NavLink>
          <h1 className="text-xl mt-20 text-dark-grey mb-3">Settings</h1>
          <hr className="border-grey -ml-6 mb-8 mr-6" />
          <NavLink
            to="/settings/edit-profile"
            onClick={changePageState}
            className="sidebar-link"
          >
            <i className="fi fi-rr-user"></i>
            Edit Profile
          </NavLink>
          <NavLink
            to="/settings/change-password"
            onClick={changePageState}
            className="sidebar-link"
          >
            <i className="fi fi-rr-lock"></i>
            Change Password
          </NavLink>
        </div>
      </div>

      <div className="flex-1 max-md:mt-5 w-full">
        <Outlet />
      </div>
    </section>
  );
};

export default SideNav;
