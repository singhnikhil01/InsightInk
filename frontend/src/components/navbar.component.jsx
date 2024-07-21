import { Link, Outlet } from "react-router-dom";
import logo from "../imgs/logo.png";
import { useState } from "react";

const Navbar = () => {
  const [searchBoxVisiblity, setSearchBoxVisiblity] = useState(false);
  return (
    <>
      <nav className="navbar relative">
        <Link to="/" className="flex-none w-10">
          <img src={logo} className="flex-none w-10" alt="Logo" />
        </Link>

        <div
          className={
            `absolute bg-white left-0 top-full mt-0.5 py-4 px-[5vw] md:border-0 md:block w-full md:relative md:inset-0 md:p-0
      md:w-auto md:show ` + (searchBoxVisiblity ? "show" : "hide")
          }
        >
          <div className="relative  md:w-auto">
            <input
              type="text"
              placeholder="Search here"
              className="w-full md:w-auto bg-gray p-3 pl-6 pr-[12%]
          md:pr-6 rounded-full placeholder:text-dark-grey
          md:pl-12 border border-black"
            />
            <i className="fi fi-rr-search absolute right-4 top-1/2 transform -translate-y-1/2 text-xl text-gray-500 md:left-5"></i>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6 ml-auto">
          <button
            className="md:hidden bg-grey w-12 h-12  rounded-full flex items-center justify-center"
            onClick={() => {
              setSearchBoxVisiblity((currentVal) => !currentVal);
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

          <Link className="btn-dark py-2" to="/signin">
            Sign In
          </Link>

          <Link className="btn-dark py-2 hidden md:block " to="/signup">
            Signup
          </Link>
        </div>
      </nav>

      <Outlet />
    </>
  );
};

export default Navbar;
