import axios from "axios";
import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";
import { useEffect, useState } from "react";
import Loader from "../components/loader.component";
import BlogPostCard from "../components/blog-post.component";
import MinimalBlogPost from "../components/nobanner-blog-post.component";
import { activeTabRef } from "../components/inpage-navigation.component";
import NoDataMessage from "../components/nodata.component";
import { filterPaginatioData } from "../common/filter-pagination-data";
import LoadMoreDataBtn from "../components/load-more.component";

const HomePage = () => {
  const [blogs, setBlog] = useState(null);
  const [trendingBlogs, setTrendingBlogs] = useState(null);
  const [pageState, setPageState] = useState("home");

  const categories = [
    "programming",
    "hollywood",
    "film making",
    "travel",
    "social media",
    "finance",
    "good",
    "adventure",
  ];

  const fetchLatestBlogs = ({ page = 1 }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs", { page })
      .then(async ({ data }) => {
        let formatedData = await filterPaginatioData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/all-latest-blogs-count",
          data_to_send: { tag: pageState },
        });
        setBlog(formatedData);
      })
      .catch((err) => {
        console.error("Error fetching latest blogs:", err);
      });
  };

  const fetchBlogsByCategory = ({ page = 1 }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
        tag: pageState,
        page: page,
      })
      .then(async ({ data }) => {
        let formatedData = await filterPaginatioData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/search-blogs-count",
          data_to_send: { tag: pageState },
        });
        setBlog(formatedData);
      })
      .catch((err) => {
        console.error("Error fetching blogs by category:", err.message);
      });
  };

  const fetchTrendingBlogs = async () => {
    try {
      const { data } = await axios.get(
        import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs"
      );
      setTrendingBlogs(data.blogs);
    } catch (err) {
      console.error("Error fetching trending blogs:", err.message);
    }
  };

  useEffect(() => {
    activeTabRef.current.click();
    if (pageState === "home") {
      fetchLatestBlogs({ page: 1 });
    } else {
      fetchBlogsByCategory({ page: 1 });
    }
    if (!trendingBlogs) {
      fetchTrendingBlogs();
    }
  }, [pageState]);

  const loadBlogByCategory = (e) => {
    const category = e.target.innerText.toLowerCase();
    setBlog(null);

    if (pageState === category) {
      setPageState("home");
      return;
    }
    setPageState(category);
  };

  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center gap-10">
        <div className="w-full">
          <InPageNavigation
            routes={[pageState, "trending blogs"]}
            defaultHidden={["trending blogs"]}
          >
            <>
              {blogs == null ? (
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
              <LoadMoreDataBtn
                state={blogs}
                fetchDataFun={
                  pageState == "home" ? fetchLatestBlogs : fetchBlogsByCategory
                }
              />
            </>

            <>
              {trendingBlogs == null ? (
                <Loader />
              ) : trendingBlogs.length ? (
                trendingBlogs.map((blog, i) => (
                  <AnimationWrapper
                    transition={{ duration: 1, delay: i * 0.1 }}
                    key={i}
                  >
                    <MinimalBlogPost blog={blog} index={i} />
                  </AnimationWrapper>
                ))
              ) : (
                <NoDataMessage message="No Trending Blogs Found" />
              )}
            </>
          </InPageNavigation>
        </div>

        <div className="min-w-[45%] lg:min-w-[450px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
          <div className="flex flex-col gap-10">
            <div>
              <h1 className="font-medium text-xl mb-8">
                Stories from all Interest
              </h1>
              <div className="flex gap-3 flex-wrap">
                {categories.map((category, i) => (
                  <button
                    key={i}
                    className={
                      "tag " +
                      (pageState === category ? "bg-black text-white" : "")
                    }
                    onClick={loadBlogByCategory}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h1 className="font-medium text-xl mb-8">
                Trending <i className="fi fi-rr-arrow-trend-up "></i>
              </h1>
              {trendingBlogs == null ? (
                <Loader />
              ) : trendingBlogs.length ? (
                trendingBlogs.map((blog, i) => (
                  <AnimationWrapper
                    transition={{ duration: 1, delay: i * 0.1 }}
                    key={i}
                  >
                    <MinimalBlogPost blog={blog} index={i} />
                  </AnimationWrapper>
                ))
              ) : (
                <NoDataMessage message="No Trending Blogs Found" />
              )}
            </div>
          </div>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default HomePage;
