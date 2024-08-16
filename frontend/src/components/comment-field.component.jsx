import { useContext, useState } from "react";
import { UserContext } from "../App";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { BlogContext } from "../pages/blog.page";

const CommentField = ({ action }) => {
  const [comment, setComment] = useState("");
  const {
    userAuth: { access_token, username, fullname, profile_img },
  } = useContext(UserContext);

  const {
    blog,
    blog: {
      _id,
      author: { _id: blog_author },
      comments,
      activity,
      activity: { total_comments, total_parent_comments },
    },
    setBlog,
    setTotalParentCommentsLoaded,
  } = useContext(BlogContext);

  const handleComment = async () => {
    if (!access_token) {
      return toast.error("Login to comment");
    }

    if (!comment.trim()) {
      return toast.error("Write something to leave a comment");
    }

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}add-comment`,
        {
          _id,
          blog_author,
          comment,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      const newComment = {
        ...data,
        commented_by: { personal_info: { username, profile_img, fullname } },
        childrenLevel: 0,
      };

      setBlog((prevBlog) => ({
        ...prevBlog,
        comments: {
          ...prevBlog.comments,
          result: [newComment, ...prevBlog.comments.result],
        },
        activity: {
          ...prevBlog.activity,
          total_comments: total_comments + 1,
          total_parent_comments: total_parent_comments + 1,
        },
      }));

      setTotalParentCommentsLoaded((prev) => prev + 1);

      toast.success("Comment added successfully");
      setComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Error posting comment. Please try again.");
    }
  };

  return (
    <>
      <Toaster />
      <textarea
        onChange={(e) => setComment(e.target.value)}
        value={comment}
        placeholder="Leave a comment...."
        className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"
      />
      <button className="btn-dark mt-5 px-10" onClick={handleComment}>
        {action}
      </button>
    </>
  );
};

export default CommentField;
