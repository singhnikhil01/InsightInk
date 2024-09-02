import { Link } from "react-router-dom";
import { getDay } from "../common/date";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";

const BlogStats = ({ stats }) => {
  return (
    <div className="flex gap-2 max-lg:mb-6 max-lg:pb-6 border-grey max-lg:border-b">
      {Object.keys(stats).map((key, i) =>
        key.includes("parent") ? null : (
          <div
            key={key} // Ensure a unique key
            className={`flex flex-col items-center w-full h-full justify-center p-4 px-6 ${
              i !== 0 ? "border-grey border-l" : ""
            }`}
          >
            <h1 className="text-xl lg:text-2xl mb-2">
              {stats[key].toLocaleString()}
            </h1>
            <p className="max-lg:text-dark-grey capitalize">
              {key.split("_")[1]}
            </p>
          </div>
        )
      )}
    </div>
  );
};

const ManagePublishedBlogsCard = ({ blog }) => {
  const { banner, blog_id, title, publishedAt, activity } = blog;
  const [showStats, setShowStats] = useState(false);
  let {
    userAuth: { access_token },
  } = useContext(UserContext);
  return (
    <>
      <div className="flex gap-10 border mb-2 max-md:px-4 border-grey pb-2 items-center shadow-sm rounded-lg ml-4">
        <img
          src={banner}
          className="max-md:hidden lg:hidden xl:block w-28 h-28 flex-none be-grey object-cover lg:ml-2 mt-2"
        />
        <div className="flex flex-col justify-between py-4  w-full min-w-[300px]">
          <div className="">
            <Link
              to={`/blog/${blog_id}`}
              className="blog-title mb-4 hover:underline"
            >
              {title}
            </Link>
            <p className="line-clamp-1">Published on {getDay(publishedAt)}</p>
          </div>

          <div className="flex  items-center gap-6 mt-3">
            <Link to={`/editor/${blog_id}`}>Edit</Link>
            <button
              className="lg:hidden pr-4 py-2 underline"
              onClick={() => {
                setShowStats((prevVal) => !prevVal);
              }}
            >
              Stats
            </button>
            <button
              className="pr-4 py-2 underline text-red"
              onClick={(e) => handleDelete(blog, access_token, e.target)}
            >
              Delete
            </button>
          </div>
        </div>
        <div className="max-lg:hidden">
          <BlogStats stats={activity} />
        </div>
      </div>
      {showStats && (
        <div className="lg:hidden">
          <BlogStats stats={activity} />
        </div>
      )}
    </>
  );
};

const ManageDraftBlogPost = ({ blog }) => {
  let { title, des, blog_id, index } = blog;
  index++;
  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  return (
    <div className="flex py-2 gap-10 border mb-4 max-md:px-4 border-grey pb-2 items-center shadow-sm rounded-lg ml-4">
      <h1 className="blog-index text-center pl-4 md:pl-6 flex-none">
        {index < 10 ? "0" + index : index}
      </h1>
      <div>
        <h1 className="blog-title mb-3">{title}</h1>
        <p className="line-clamp-2 font-gelasio">
          {des?.length ? des : "No Description"}
        </p>

        <div className="flex gap-6 mt-3 items-center">
          <Link to={`/editor/${blog_id}`} className="pr-4 py-2 underline">
            Edit
          </Link>
          <button
            className="pr-4 py-2 underline text-red"
            onClick={(e) => handleDelete(blog, access_token, e.target)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const handleDelete = (blog, access_token, target) => {
  console.log(blog);
  let { index, blog_id, setStateFun } = blog;
  target.setAttribute("disabled", true);
  axios
    .post(
      `${import.meta.env.VITE_SERVER_DOMAIN}delete-blog`,
      { blog_id },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    )
    .then(({ data }) => {
      target.removeAttribute("disabled");
      setStateFun((preVal) => {
        let { deletedDocCount, totalDocs, results } = preVal;
        results.splice(index, 1);
        if (!results.length && totalDocs - 1 > 0) {
          return null;
        }
        return {
          ...preVal,
          totalDocs: totalDocs - 1,
          deletedDocCount: deletedDocCount + 1,
        };
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
export { ManagePublishedBlogsCard, ManageDraftBlogPost };
