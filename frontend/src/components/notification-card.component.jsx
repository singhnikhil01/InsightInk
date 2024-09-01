import { Link } from "react-router-dom";
import { getDay } from "../common/date";
import { useContext, useState } from "react";
import axios from "axios";
import NotificationCommentField from "./notification-comment-field.component";
import { UserContext } from "../App";

const NotificationCard = ({ data, index, notificationState }) => {
  const {
    user,
    reply,
    user: {
      personal_info: { profile_img, fullname, username },
    },
    type,
    replied_on_comment,
    comment,
    blog: { _id, blog_id, title },
    createdAt,
    seen,
    _id: notification_id,
  } = data;

  const {
    userAuth: {
      username: author_username,
      profile_img: author_profile_image,
      access_token,
    },
  } = useContext(UserContext);

  const [isReplying, setReplying] = useState(false);
  const {
    notifications,
    setNotifications,
    notifications: { results, totalDocs },
  } = notificationState;

  const handleReplyClick = () => {
    setReplying((prev) => !prev);
  };

  const handleDeleteFun = (comment_id, deleteType, target) => {
    target.setAttribute("disabled", true);
    axios
      .post(
        `${import.meta.env.VITE_SERVER_DOMAIN}delete-comment`,
        { _id: comment_id },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(() => {
        if (deleteType === "comment") {
          results.splice(index, 1);
        } else {
          delete results[index].reply;
        }
        target.removeAttribute("disabled");
        setNotifications({
          ...notifications,
          results,
          totalDocs: totalDocs - 1,
          deleteDocCount: notifications.deleteDocCount + 1,
        });
      })
      .catch((error) => {
        console.error("Error deleting comment:", error);
        target.removeAttribute("disabled");
      });
  };

  return (
    <>
      <div
        className={
          "p-6 border border-grey bg-white shadow-lg rounded-lg mb-4 " +
          (!seen ? "border-l-black border-l-2" : "")
        }
      >
        <div className="flex gap-5 mb-3">
          <img
            src={profile_img}
            alt={`${fullname}'s profile`}
            className="w-10 h-10 flex-none rounded-full"
          />
          <div className="w-full">
            <h1 className="font-medium text-xl text-dark-grey">
              <span className="lg:inline-block hidden capitalize">
                {fullname}
              </span>
              <Link
                to={`/user/${username}`}
                className="mx-1 text-black underline"
              >
                @{username}
              </Link>
              <span className="font-normal">
                {type === "like"
                  ? "liked your blog"
                  : type === "comment"
                  ? "commented on"
                  : "replied on"}
              </span>
            </h1>
            {type === "reply" && replied_on_comment && (
              <div className="p-4 mt-4 rounded-md bg-grey">
                <p>{replied_on_comment.comment}</p>
              </div>
            )}
            {type !== "reply" && (
              <Link
                to={`/blog/${blog_id}`}
                className="font-medium text-dark-grey hover:underline line-clamp-1"
              >{`"${title}"`}</Link>
            )}
          </div>
        </div>
        {type !== "like" && (
          <p className="ml-10 pl-5 font-gelasio text-xl my-5">
            {comment.comment}
          </p>
        )}

        <div className="ml-14 pl-5 mt-3 text-dark-grey flex gap-8">
          <p>{getDay(createdAt)}</p>
          {type !== "like" && (
            <>
              {!reply && (
                <button
                  className="underline hover:text-black"
                  onClick={handleReplyClick}
                >
                  Reply
                </button>
              )}
              <button
                className="underline hover:text-black"
                onClick={(e) =>
                  handleDeleteFun(
                    comment._id,
                    reply ? "reply" : "comment",
                    e.target
                  )
                }
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
      {isReplying && (
        <div className="mt-8">
          <NotificationCommentField
            _id={_id}
            blog_author={user}
            index={index}
            replying_to={comment._id}
            setReplying={setReplying}
            notification_id={notification_id}
            notificationData={notificationState}
          />
        </div>
      )}
      {reply && (
        <div className="ml-10 p-5 bg-grey mt-5 rounded-md">
          <div className="flex gap-3 mb-3 ">
            <img
              src={author_profile_image}
              alt={`${author_username}'s profile`}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <h1 className="font-medium text-xl text-dark-grey ">
                <Link
                  to={`/user/${author_username}`}
                  className=" mx-1 text-black underline"
                >
                  @{author_username}
                </Link>
                <span className="font-normal">replied to</span>
                <Link
                  to={`/user/${username}`}
                  className=" mx-1 text-black underline"
                >
                  @{username}
                </Link>
              </h1>
            </div>
          </div>
          <p className="ml-14 font-gelasio text-xl my-2">{reply.comment}</p>

          <button
            className="underline hover:text-black ml-14 mt-2 "
            onClick={(e) => handleDeleteFun(reply._id, "reply", e.target)}
          >
            Delete
          </button>
        </div>
      )}
    </>
  );
};

export default NotificationCard;
