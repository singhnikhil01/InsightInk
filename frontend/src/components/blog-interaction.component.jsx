import { useContext, useEffect } from "react";
import { BlogContext } from "../pages/blog.page";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";

const BlogInteraction = () => {
  let {
    blog: {
      _id,
      blog_id,
      title,
      activity: { total_likes, total_comments },
      author: {
        personal_info: { username: author_username },
      },
    },
    setBlog,
    isLikedByUser,
    setLikedByUser,
  } = useContext(BlogContext);

  let {
    userAuth: { username, access_token },
  } = useContext(UserContext);

  useEffect(() => {
    if (access_token) {
      axios
        .post(
          `${import.meta.env.VITE_SERVER_DOMAIN}isliked-by-user`,
          { _id },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        )
        .then(({ data: { result } }) => {
          setLikedByUser(result);
        })
        .catch((err) => {
          console.error("Error fetching like status:", err);
        });
    }
  }, [blog_id, access_token, _id]);

  const HandleLike = () => {
    if (access_token) {
      const newLikeStatus = !isLikedByUser;
      const newTotalLikes = newLikeStatus ? total_likes + 1 : total_likes - 1;

      setBlog((prevBlog) => ({
        ...prevBlog,
        activity: {
          ...prevBlog.activity,
          total_likes: newTotalLikes,
        },
      }));

      axios
        .post(
          `${import.meta.env.VITE_SERVER_DOMAIN}like-blog`,
          {
            _id,
            isLikedByUser: newLikeStatus,
          },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        )
        .then(({ data }) => {
          setLikedByUser(newLikeStatus);
          console.log("Like status updated:", data);
        })
        .catch((err) => {
          console.error("Error updating like status:", err);
          toast.error("Failed to update like status. Please try again.");
          // Rollback UI change on error
          setBlog((prevBlog) => ({
            ...prevBlog,
            activity: {
              ...prevBlog.activity,
              total_likes: newLikeStatus ? total_likes - 1 : total_likes + 1,
            },
          }));
        });
    } else {
      toast.error("Please login to like this Blog");
    }
  };

  return (
    <>
      <Toaster />
      <hr className="border-grey my-2" />

      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <button
            className={
              "w-10 h-10 rounded-full flex justify-center items-center text-2xl " +
              (isLikedByUser ? "bg-red/20 text-red" : "bg-dark-grey/20")
            }
            onClick={HandleLike}
          >
            <i
              className={
                "fi " + (isLikedByUser ? "fi-ss-heart" : "fi-rr-heart")
              }
            ></i>
          </button>
          <p className="text-xl text-gray-600">{total_likes}</p>

          <button className="w-10 h-10 rounded-full flex items-center justify-center bg-dark-grey/20">
            <i className="fi fi-rr-comment-dots text-xl"></i>
          </button>
          <p className="text-xl text-gray-600">{total_comments}</p>
        </div>

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
