import { Link } from "react-router-dom";
import { getDay } from "../common/date";

const BlogPostCard = ({ content, author }) => {
  const {
    publishedAt,
    tags = [],
    title,
    des,
    banner,
    activity: { total_likes } = {},
    blog_id: id,
  } = content;
  const { fullname, profile_img, username } = author;

  return (
    <Link
      to={`/blog/${id}`}
      className="flex gap-8 items-center border border-grey pb-5 mb-4"
    >
      <div className="w-full ml-6 mt-3">
        <div className="flex gap-2 items-center mb-7">
          <img
            src={profile_img}
            alt={`${fullname}'s profile`}
            className="w-6 h-6 rounded-full"
          />
          <p className="line-clamp-1">
            {fullname} @{username}
          </p>
          <p className="min-w-fit">{getDay(publishedAt)}</p>
        </div>
        <h1 className="blog-title">{title}</h1>
        <p className="my-3 text-xl font-gelasio leading-7 max-sm:hidden md:max-[1100px]:hidden line-clamp-2">
          {des}
        </p>

        <div className="flex gap-4 mt-7">
          {tags.length > 0 && (
            <span className="btn-light py-1 px-4">{tags[0]}</span>
          )}
          <span className="ml-3 flex items-center gap-2 text-dark-grey">
            <i className="fi fi-rr-heart text-xl" aria-hidden="true"></i>
            {total_likes}
          </span>
        </div>
      </div>

      <div className="h-28 w-32 bg-gray-200 mr-4 overflow-hidden rounded-md">
        <img src={banner} alt={title} className="w-full h-full object-cover" />
      </div>
    </Link>
  );
};

export default BlogPostCard;
