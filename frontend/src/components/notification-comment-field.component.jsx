import { useContext, useState } from "react";
import { toast } from "react-hot-toast";
import { UserContext } from "../App";
import axios from "axios";

const NotificationCommentField = ({
  _id,
  blog_author: { _id: user_id },
  index,
  replying_to,
  setReplying,
  notification_id,
  notificationData: { notifications, setNotifications },
}) => {
  const [comment, setComment] = useState("");
  const {
    userAuth: { access_token },
  } = useContext(UserContext);

  const handleComment = async () => {
    if (!comment.trim()) {
      return toast.error("Write something to leave a comment");
    }

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}add-comment`,
        {
          _id,
          blog_author: user_id,
          comment,
          replying_to,
          notification_id,
        },
        { headers: { Authorization: `Bearer ${access_token}` } }
      );

      setReplying(false);

      const updatedResults = [...notifications.results];
      updatedResults[index].reply = { comment, _id: data._id };

      setNotifications({ ...notifications, results: updatedResults });
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Error posting comment. Please try again.");
    }
  };

  return (
    <>
      <textarea
        onChange={(e) => setComment(e.target.value)}
        value={comment}
        placeholder={`Leave a reply...`}
        className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"
      />
      <button className="btn-dark mt-5 px-10" onClick={handleComment}>
        Reply
      </button>
    </>
  );
};

export default NotificationCommentField;
