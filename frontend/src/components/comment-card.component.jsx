import { useContext, useState } from "react";
import { getDay } from "../common/date";
import { UserContext } from "../App";
import { Toaster, toast } from "react-hot-toast";
import CommentField from "./comment-field.component";
import { BlogContext } from "../pages/blog.page";
import axios from "axios";

const CommentCard = ({ index, leftVal, commentdata }) => {
  const {
    comment,
    commented_by: {
      personal_info: { profile_img, fullname, username },
    },
    commentedAt,
    _id,
    children,
  } = commentdata;

  const {
    blog,
    blog: { comments: commentsArr },
    setBlog,
  } = useContext(BlogContext);

  const {
    userAuth: { access_token },
  } = useContext(UserContext);

  const [isReplying, setReplying] = useState(false);

  const removeCommentsCards = (startingPoint) => {
    if (commentsArr[startingPoint]) {
      while (
        commentsArr[startingPoint].childrenLevel > commentdata.childrenLevel
      ) {
        commentsArr.splice(startingPoint, 1);
        if (!commentsArr[startingPoint]) {
          break;
        }
      }
    }

    setBlog({ ...blog, comments: [...commentsArr] });
  };

  const loadReplies = async ({ skip = 0 }) => {
    if (children.length) {
      handleHideReplies();
      try {
        const {
          data: { replies },
        } = await axios.post(
          `${import.meta.env.VITE_SERVER_DOMAIN}get-replies`,
          { _id, skip }
        );

        commentdata.isReplyLoaded = true;
        replies.forEach((reply, i) => {
          reply.childrenLevel = commentdata.childrenLevel + 1;
          commentsArr.splice(index + 1 + i + skip, 0, reply);
        });

        setBlog({ ...blog, comments: [...commentsArr] });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleHideReplies = () => {
    commentdata.isReplyLoaded = false;
    removeCommentsCards(index + 1);
  };

  const handleReplyClick = () => {
    if (!access_token) {
      return toast.error("You must log in first");
    }
    setReplying((prev) => !prev);
  };

  return (
    <div
      className="w-full border border-grey group-[]: rounded-md mb-5 mt-6"
      style={{ paddingLeft: `${leftVal * 4}px` }}
    >
      <div className="flex items-center mt-4 gap-3 mb-4 ml-4">
        <img
          src={profile_img}
          alt={`${fullname}'s profile`}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="font-semibold text-gray-800 capitalize">{fullname}</p>
          <p className="text-gray-600">@{username}</p>
        </div>
        <p className="text-gray-500 text-sm mr-4">{getDay(commentedAt)}</p>
      </div>
      <p className="font-gelasio text-xl ml-10">{comment}</p>
      <div className="flex gap-3 items-center mt-5 ml-8">
        <button className="underline mb-4" onClick={handleReplyClick}>
          Reply
        </button>
        {commentdata.isReplyLoaded ? (
          <button
            className="mb-4 text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
            onClick={handleHideReplies}
          >
            <i className="fi fi-rs-comment-dots"></i>
            <p className="underline">Hide Reply</p>
          </button>
        ) : (
          <button
            className="mb-4 text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
            onClick={loadReplies}
          >
            <i className="fi fi-rs-comment-dots"></i>
            <p className="underline">{children.length} Reply</p>
          </button>
        )}
      </div>

      {isReplying && (
        <div className="mt-8">
          <CommentField
            action="reply"
            index={index}
            replyingTo={_id}
            setReplying={setReplying}
          />
        </div>
      )}
    </div>
  );
};

export default CommentCard;
