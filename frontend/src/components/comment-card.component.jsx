import { useContext } from "react";
import { getDay } from "../common/date";
import { UserContext } from "../App";
const CommentCard = ({ index, leftVal, commentdata }) => {
  let {
    comment,
    commented_by: {
      personal_info: { profile_img, fullname, username },
    },
    commentedAt,
  } = commentdata;

  let {
    userAuth: { access_token },
  } = useContext(UserContext);
  const HandleReplyClick = () => {};
  return (
    <div
      className="w-full border border-grey rounded-md mb-5 mt-6"
      style={{ paddingLeft: `${leftVal * 10}px` }}
    >
      <div className="flex items-center mt-4 gap-3 mb-4 ml-4">
        <img
          src={profile_img}
          alt={`${fullname}'s profile`}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="font-semibold text-gray-800">{fullname}</p>
          <p className="text-gray-600">@{username}</p>
        </div>
        <p className="text-gray-500 text-sm mr-4">{getDay(commentedAt)}</p>
      </div>
      <p className="font-gelasio text-xl ml-10">{comment}</p>
      <div className="flex gap-5 items-center mt-5">
        <button className="underline ml-10" onClick={HandleReplyClick}>
          Reply
        </button>
      </div>
    </div>
  );
};
export default CommentCard;
