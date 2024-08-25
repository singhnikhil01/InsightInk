import { Link } from "react-router-dom"; // Make sure to import Link from react-router-dom
import pageNotFoundImage from "../imgs/404.png";
import fullLogo from "../imgs/full-logo.png";
const PageNotFound = () => {
  return (
    <section className="h-cover p-10 flex flex-col items-center gap-20 text-center">
      <img
        src={pageNotFoundImage}
        alt="Page not found"
        className="select-none border-2 border-grey w-72 aspect-square object-cover rounded"
      />
      <h1 className="text-3xl font-gelasio leading-7">Page not found</h1>
      <p>
        The page you are looking for does not exist. Head back to{" "}
        <Link to="/" className="text-black font-bold underline">
          HomePage
        </Link>
        .
      </p>

      <div className="mt-auto">
        <img
          src={fullLogo}
          className="h-20 w-80 object-contain block mx-auto select-none"
        />
        <p className="mt-5 text-dark-grey">
          Read millions of stories around the world
        </p>
      </div>
    </section>
  );
};

export default PageNotFound;
