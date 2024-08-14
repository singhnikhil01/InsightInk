import { Link, useNavigate, useParams } from "react-router-dom";
import logo from "../imgs/logo.png";
import { Toaster, toast } from "react-hot-toast";
import AnimationWrapper from "../common/page-animation";
import { useContext, useState } from "react";
import { EditorContext } from "../pages/editor.pages";
import Tag from "./tags.component";
import axios from "axios";
import { UserContext } from "../App";

const PublishForm = () => {
  const [loading, setLoading] = useState(false);
  const { userAuth } = useContext(UserContext);
  const access_token = userAuth ? userAuth.access_token : null;
  let navigate = useNavigate();

  let { blog_id } = useParams();

  const characterLimit = 200;
  let taglimit = 10;
  const {
    blog: { banner, title, content, des, tags },
    setEditorState,
    setBlog,
  } = useContext(EditorContext);

  const handleCloseEvent = () => {
    setEditorState("editor");
  };

  const handleBlogTitleChange = (e) => {
    const newTitle = e.target.value;
    setBlog((prevBlog) => ({
      ...prevBlog,
      title: newTitle,
    }));
  };

  const handleBlogDesChange = (e) => {
    const newDescription = e.target.value;
    setBlog((prevBlog) => ({
      ...prevBlog,
      des: newDescription,
    }));
  };

  const handleTitleKeyDown = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
    }
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13 || e.keyCode === 188) {
      e.preventDefault();
      let tag = e.target.value;
      if (tags.length < taglimit) {
        if (!tags.includes(tag) && tag.length) {
          setBlog((prevBlog) => ({
            ...prevBlog,
            tags: [...tags, tag],
          }));
        }
      } else {
        toast.error(`you can add max ${taglimit} tags`);
      }

      e.target.value = "";
    }
  };

  const publishBlog = (e) => {
    if (e.target.className.includes("disable") || loading) {
      return;
    }

    if (!title.length) {
      return toast.error("Write blog title before publishing");
    }
    if (!des.length || des.length > characterLimit) {
      return toast.error(
        `Write a description about your blog within ${characterLimit} to publish`
      );
    }
    if (!tags.length) {
      return toast.error("Enter at least 1 tag to help us rank your Blog");
    }
    let loadingToast = toast.loading("Publishing....");
    setLoading(true);
    e.target.classList.add("disable");

    let blogObj = {
      title,
      banner,
      des,
      content,
      tags,
      draft: false,
    };
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "create-blog",
        { ...blogObj, id: blog_id },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(() => {
        e.target.classList.remove("disable");
        toast.dismiss(loadingToast);
        toast.success("Published");
        setTimeout(() => {
          navigate("/");
        }, 1000);
      })
      .catch(({ response }) => {
        e.target.classList.remove("disable");
        toast.dismiss(loadingToast);
        toast.error(response.data.error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <section className="w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4 relative">
      <Toaster />
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <p className="text-white text-2xl">Publishing...</p>
        </div>
      )}
      <button
        className="w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]"
        onClick={handleCloseEvent}
      >
        <i className="fi fi-br-cross"></i>
      </button>

      <div className="max-w-[550px] center">
        <p className="text-dark-grey mb-1">Preview</p>
        <div className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4">
          <img src={banner} alt="Blog banner" />
        </div>

        <h1 className="text-4xl font-medium mt-2 leading-tight overflow-hidden break-words word-wrap">
          {title}
        </h1>

        <p className="font-gelasio text-2xl leading-7 mt-4 overflow-hidden break-words word-wrap">
          {des}
        </p>
      </div>

      <div className="border-grey lg:border-1 lg:pl-8">
        <p className="text-dark-grey mb-2 mt-9">Blog Title</p>
        <input
          type="text"
          placeholder="Blog Title"
          defaultValue={title}
          onChange={handleBlogTitleChange}
          className="input-box pl-4"
        />

        <p className="text-dark-grey mb-2 mt-9">
          Short Description about your blog
        </p>
        <textarea
          maxLength={characterLimit}
          defaultValue={des}
          className="h-30 resize-none leading-7 input-box pl-4"
          onChange={handleBlogDesChange}
          onKeyDown={handleTitleKeyDown}
        />
        <p>{characterLimit - des.length} characters left</p>

        <p className="text-dark-grey mb-2 mt-9">
          Topics - (Helps in Searching and ranking your Blog post)
        </p>

        <div className="relative input-box pl-2 py-3 pb-4">
          <input
            type="text"
            placeholder="topics"
            className="sticky input-box bg-white top-0 left-0 pl-4 mb-3 focus:bg-white"
            onKeyDown={handleKeyDown}
          />

          {tags.map((tag, i) => {
            return <Tag tag={tag} tagIndex={i} key={i} />;
          })}
        </div>
        <p className="mt-1 mb-4 text-dark-grey text-right">
          {taglimit - tags.length} Tags left
        </p>

        <button
          className="btn-dark  px-8"
          onClick={publishBlog}
          disabled={loading}
        >
          Publish
        </button>
      </div>
    </section>
  );
};

export default PublishForm;
