import { useContext } from "react";
import { BlogContext } from "../pages/blog.page";
import { Link } from "react-router-dom";
import { UserContext } from "../App";

const BlogInteraction = () => {
  const {
    blog: {
      blog_id,
      title,
      activity,
      activity: { total_likes, total_comments },
      author: {
        personal_info: { username: author_username },
      },
    },
  } = useContext(BlogContext);

  let {
    userAuth: { username },
  } = useContext(UserContext);

  return (
    <>
      <hr className="border-grey my-2" />

      <div className="flex justify-between items-center">
        {/* First div: Interaction buttons */}
        <div className="flex gap-4 items-center">
          <button className="w-10 h-10 rounded-full flex items-center justify-center bg-grey/80">
            <i className="fi fi-rr-heart text-xl"></i>
          </button>
          <p className="text-xl text-dark-grey">{total_likes}</p>

          <button className="w-10 h-10 rounded-full flex items-center justify-center bg-grey/80">
            <i className="fi fi-rr-comment-dots text-xl"></i>
          </button>
          <p className="text-xl text-dark-grey">{total_comments}</p>
        </div>

        {/* Second div: Links */}
        <div className="flex gap-4 items-center">
          {username === author_username && (
            <Link
              to={`/editor/${blog_id}`}
              className="underline hover:text-purple"
            >
              Edit
            </Link>
          )}
          <Link
            to={`https://twitter.com/intent/tweet?text=Read ${title}&url=${location.href}`}
            target="_blank"
            className="text-xl"
          >
            <i className="fi fi-brands-twitter text-xl hover:text-twitter"></i>
          </Link>
        </div>
      </div>

      <hr className="border-grey my-2" />
    </>
  );
};

export default BlogInteraction;
