import { useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { UserContext } from "../App";
import { filterPaginatioData } from "../common/filter-pagination-data";
import InPageNavigation from "../components/inpage-navigation.component";
import Loader from "../components/loader.component";
import NoDataMessage from "../components/nodata.component";
import AnimationWrapper from "../common/page-animation";
import {
  ManagePublishedBlogsCard,
  ManageDraftBlogPost,
} from "../components/manage-blogcard.component";
import LoadMoreDataBtn from "../components/load-more.component";
import { useSearchParams } from "react-router-dom";

const ManageBlogs = () => {
  const [blogs, setBlogs] = useState(null); // Set to null initially
  const [drafts, setDrafts] = useState(null); // Set to null initially
  const [query, setQuery] = useState("");
  let activeTab = useSearchParams()[0].get("tab");

  const {
    userAuth: { access_token },
  } = useContext(UserContext);

  const getBlogs = useCallback(
    async ({ page, draft, deletedDocCount = 0 }) => {
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_SERVER_DOMAIN}user-written-blogs`,
          {
            page,
            draft,
            query,
            deletedDocCount,
          },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );

        const formattedData = await filterPaginatioData({
          state: draft ? drafts : blogs,
          data: data.blogs,
          page,
          user: access_token,
          countRoute: "user-written-blogs-count",
          data_to_send: { draft, query },
        });

        if (draft) {
          setDrafts(formattedData);
        } else {
          setBlogs(formattedData);
        }
      } catch (err) {
        console.log(err);
      }
    },
    [access_token, query, blogs, drafts]
  );

  useEffect(() => {
    if (access_token && blogs === null && drafts === null) {
      getBlogs({ page: 1, draft: false });
      getBlogs({ page: 1, draft: true });
    }
  }, [access_token, getBlogs, blogs, drafts]);

  useEffect(() => {
    if (access_token && query !== "") {
      getBlogs({ page: 1, draft: false });
      getBlogs({ page: 1, draft: true });
    }
  }, [query, access_token, getBlogs]);

  const handleSearch = (e) => {
    const searchQuery = e.target.value;
    setQuery(searchQuery);

    if (e.keyCode === 13 && searchQuery.length) {
      setBlogs(null);
      setDrafts(null);
    }
  };

  const handleChange = (e) => {
    if (!e.target.value) {
      setQuery("");
      setDrafts(null);
      setBlogs(null);
    }
  };

  return (
    <>
      <h1 className="max-md:hidden text-2xl lg:my-4">Manage Blogs</h1>
      <div className="relative max-md:mt-2 mb-10">
        <input
          type="search"
          className="w-full bg-grey p-4 pl-12 pr-6 rounded-full placeholder:text-dark-grey"
          placeholder="Search Blogs"
          onChange={handleChange}
          onKeyDown={handleSearch}
        />
        <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-dark-grey"></i>
      </div>

      <InPageNavigation
        routes={["Published Blogs", "Drafts"]}
        defaultActiveIndex={activeTab != "draft" ? 0 : 1}
      >
        <>
          {blogs == null ? (
            <Loader />
          ) : blogs.results.length ? (
            blogs.results.map((blog, i) => (
              <AnimationWrapper key={i} transition={{ delay: i * 0.04 }}>
                <ManagePublishedBlogsCard
                  blog={{ ...blog, index: i, setStateFun: setBlogs }}
                />
              </AnimationWrapper>
            ))
          ) : (
            <NoDataMessage message="No published Blogs" />
          )}
          <LoadMoreDataBtn
            state={blogs}
            fetchDataFun={getBlogs}
            additionalParam={{
              draft: false,
              deletedDocCount: blogs ? blogs.deletedDocCount : undefined,
            }}
          />
        </>
        <>
          {drafts == null ? (
            <Loader />
          ) : drafts.results.length ? (
            drafts.results.map((blog, i) => (
              <AnimationWrapper key={i} transition={{ delay: i * 0.04 }}>
                <ManageDraftBlogPost
                  blog={{ ...blog, index: i, setStateFun: setDrafts }}
                />
              </AnimationWrapper>
            ))
          ) : (
            <NoDataMessage message="No Draft Blogs" />
          )}

          <LoadMoreDataBtn
            state={blogs}
            fetchDataFun={getBlogs}
            additionalParam={{
              draft: false,
              deletedDocCount: drafts ? drafts.deletedDocCount : undefined,
            }}
          />
        </>
      </InPageNavigation>
    </>
  );
};

export default ManageBlogs;
