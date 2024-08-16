import { useContext } from "react";
import { BlogContext } from "../pages/blog.page";
import CommentField from "./comment-field.component";
import NoDataMessage from "./nodata.component";
import AnimationWrapper from "../common/page-animation";
import CommentCard from "./comment-card.component";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
export const fetchComments = async ({
  skip = 0,
  blog_id,
  setParentCommentCountFun,
  comment_array = null,
}) => {
  try {
    const { data } = await axios.post(
      `${import.meta.env.VITE_SERVER_DOMAIN}get-blog-comments`,
      {
        blog_id,
        skip,
      }
    );

    data.forEach((comment) => {
      comment.childrenLevel = 0;
    });
    setParentCommentCountFun((prevVal) => prevVal + data.length);
    return {
      result: comment_array ? [...comment_array, ...data] : data,
    };
  } catch (error) {
    console.error("Error fetching comments:", error);
    toast.error("Error fetching comments. Please try again.");
    return { result: [] };
  }
};

const CommentsContainer = () => {
  const {
    blog,
    blog: {
      title,
      comments: { result: commentsArr },
      activity: { total_parent_comments },
    },
    setBlog,
    commentsWrapper,
    setCommentsWrapper,
    totalParentsCommentsLoaded,
    setTotalParentCommentsLoaded,
  } = useContext(BlogContext);

  const loadMoreComments = async () => {
    let newCommentsarr = await fetchComments({
      skip: totalParentsCommentsLoaded,
      blog_id: blog._id,
      setParentCommentCountFun: setTotalParentCommentsLoaded,
      comment_array: commentsArr,
    });
    setBlog({ ...blog, comments: newCommentsarr });
  };

  return (
    <div
      className={`fixed duration-700 right-0 top-0 w-[30%] min-w-[350px] h-full z-50 bg-white shadow-2xl p-8 px-16 overflow-y-auto overflow-x-hidden ${
        commentsWrapper ? "top-0 sm:right-0" : "top-[100%] sm:right-[-100%]"
      }`}
    >
      <Toaster />
      <div className="relative">
        <h1 className="text-xl font-medium">Comments</h1>
        <p className="text-lg mt-2 w-[70%] text-dark-grey line-clamp-1">
          {title}
        </p>

        <button
          className="absolute top-0 right-0 flex justify-center items-center w-12 h-12  rounded-full bg-grey"
          onClick={() => setCommentsWrapper((prev) => !prev)}
        >
          <i className="fi fi-br-cross text-xl mt-1"></i>
        </button>
      </div>

      <hr className="border-grey my-8 w-[120%] -ml-10" />
      <CommentField action={"comment"} />
      {commentsArr?.length ? (
        commentsArr.map((comment, i) => {
          return (
            <AnimationWrapper key={i}>
              <CommentCard
                index={i}
                leftVal={comment.childrenLevel * 4}
                commentdata={comment}
              />
            </AnimationWrapper>
          );
        })
      ) : (
        <NoDataMessage message="No Comments" />
      )}
      {total_parent_comments > totalParentsCommentsLoaded ? (
        <button
          className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
          onClick={loadMoreComments}
        >
          Load More
        </button>
      ) : (
        ""
      )}
    </div>
  );
};

export default CommentsContainer;
