import { useParams } from "react-router-dom";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { UserContext } from "../App.jsx";
import { Link } from "react-router-dom";
import AboutUser from "../components/about.component.jsx";
import { filterPaginatioData } from "../common/filter-pagination-data.jsx";
import InPageNavigation from "../components/inpage-navigation.component.jsx";
import BlogPostCard from "../components/blog-post.component.jsx";
import NoDataMessage from "../components/nodata.component.jsx";
import LoadMoreDataBtn from "../components/load-more.component.jsx";
import PageNotFound from "./404.page.jsx";

export const profileDataStructure = () => ({
  personal_info: {
    fullname: "",
    username: "",
    email: "",
    profile_img: "",
    bio: "",
  },
  account_info: {
    total_posts: 0,
    total_reads: 0,
  },
});

const ProfilePage = () => {
  let { id: profileID } = useParams();
  let [profile, setProfile] = useState(profileDataStructure());
  let [loading, setLoading] = useState(true);
  let [blogs, setBlogs] = useState(null);
  let {
    userAuth: { username },
  } = useContext(UserContext);

  let [profileLoaded, setProfileLoaded] = useState("");

  let {
    personal_info: { fullname, username: profile_username, profile_img, bio },
    account_info: { total_posts, total_reads },
    social_links,
    joinedAt,
  } = profile;

  const getBlogs = ({ page = 1, user_id }) => {
    user_id = user_id === undefined ? blogs.user_id : user_id;
    axios
      .post(`${import.meta.env.VITE_SERVER_DOMAIN}search-blogs`, {
        author: user_id,
        page,
      })
      .then(async ({ data }) => {
        let formatedData = await filterPaginatioData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "search-blogs-count",
          data_to_send: { author: user_id },
        });

        formatedData.user_id = user_id;
        setBlogs(formatedData);
      })
      .catch((err) => {
        console.error("Error fetching blogs:", err);
      });
  };

  const fetchUserProfile = () => {
    axios
      .post(`${import.meta.env.VITE_SERVER_DOMAIN}get-profile`, {
        username: profileID,
      })
      .then(({ data: user }) => {
        if (user) {
          setProfile(user);
          setProfileLoaded(profileID);
          getBlogs({ user_id: user._id });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching user profile:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (profileID !== profileLoaded) {
      setBlogs(null);
      resetState();
      fetchUserProfile();
    } else if (blogs === null) {
      fetchUserProfile();
    }
  }, [profileID]);

  const resetState = () => {
    setProfile(profileDataStructure());
    setProfileLoaded("");
    setLoading(true);
  };

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : profile_username.length ? (
        <section className="h-cover md:flex flex-row items-start gap-5 min-[1100px]:gap-12">
          <div className="mt-12 flex flex-col max-md:items-center gap-2 min-w-[250px] max-w-[350px] items-left md:w-[50%] md:pl-8 md:border-l border-grey md:sticky md:top-[100px] md:py-10">
            <img
              src={profile_img}
              className="w-48 h-48 bg-grey rounded-full md:w-32 md:h-32"
              alt={`${profile_username}'s profile`}
            />
            <h1 className="text-2xl font-medium">@{profile_username}</h1>
            <p className="text-xl capitalize h-6">{fullname}</p>
            <p>
              {total_posts.toLocaleString()} Blogs -{" "}
              {total_reads.toLocaleString()} Reads
            </p>
            <div className="flex gap-4 mt-2 rounded-md">
              {profileID === username && (
                <Link
                  to={"/settings/edit-profile"}
                  className="btn-light rounded-md"
                >
                  Edit Profile
                </Link>
              )}
            </div>
            <AboutUser
              classname="max-md:hidden"
              bio={bio}
              social_links={social_links}
              joinedAt={joinedAt}
            />
          </div>
          <div className="max:md:mt-12 w-full mt-4">
            <InPageNavigation
              routes={["Blogs Published", "About"]}
              defaultHidden={["About"]}
            >
              <>
                {blogs === null ? (
                  <Loader />
                ) : blogs.results.length ? (
                  blogs.results.map((blog, i) => (
                    <AnimationWrapper
                      transition={{ duration: 1, delay: i * 0.1 }}
                      key={i}
                    >
                      <BlogPostCard
                        content={blog}
                        author={blog.author.personal_info}
                      />
                    </AnimationWrapper>
                  ))
                ) : (
                  <NoDataMessage message="No Blogs Found" />
                )}
                <LoadMoreDataBtn state={blogs} fetchDataFun={getBlogs} />
              </>
              <AboutUser
                bio={bio}
                social_links={social_links}
                joinedAt={joinedAt}
              />
            </InPageNavigation>
          </div>
        </section>
      ) : (
        <PageNotFound />
      )}
    </AnimationWrapper>
  );
};

export default ProfilePage;
