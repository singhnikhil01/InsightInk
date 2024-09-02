import { Link, useNavigate, useParams } from "react-router-dom";
import logo from "../imgs/logo.png";
import AnimationWrapper from "../common/page-animation";
import defaultBanner from "../imgs/blog banner.png";
import { uploadImage } from "../common/aws";
import { useContext, useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { EditorContext } from "../pages/editor.pages";
import EditorJS from "@editorjs/editorjs";
import { tools } from "./tools.component";
import axios from "axios";
import { UserContext } from "../App";

const BlogEditor = () => {
  const [loading, setLoading] = useState(false);
  const { blog_id } = useParams();
  const { userAuth } = useContext(UserContext);
  const access_token = userAuth?.access_token || null;
  const navigate = useNavigate();

  const {
    blog,
    blog: { title = "", banner = "", content, tags, des } = {},
    setBlog,
    textEditor,
    setTextEditor,
    setEditorState,
  } = useContext(EditorContext);

  useEffect(() => {
    if (!textEditor.isReady) {
      const editor = new EditorJS({
        holder: "textEditor",
        data: Array.isArray(content) ? content[0] : content,
        tools: tools,
        placeholder: "Let's write an awesome stories",
      });
      setTextEditor(editor);
    }
  }, [textEditor, content, setTextEditor]);

  const handleBannerUpload = async (e) => {
    const img = e.target.files[0];
    if (img) {
      const loadingToast = toast.loading("Uploading...");
      try {
        const url = await uploadImage(img);
        if (url) {
          toast.dismiss(loadingToast);
          toast.success("Uploaded");
          setBlog((prev) => ({ ...prev, banner: url }));
        }
      } catch (err) {
        toast.dismiss(loadingToast);
        toast.error("Upload failed");
        console.error(err);
      }
    }
  };

  const handleTitleChange = (e) => {
    const input = e.target;
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
    setBlog((prev) => ({ ...prev, title: input.value }));
  };

  const handleError = (e) => {
    e.target.src = defaultBanner;
  };

  const handlePublishEvent = () => {
    if (!banner) return toast.error("Upload a blog banner to publish it");
    if (!title.trim()) return toast.error("Write a blog title to publish it");

    if (textEditor) {
      textEditor
        .save()
        .then((data) => {
          if (data.blocks.length) {
            setBlog((prev) => ({ ...prev, content: data }));
            setEditorState("Publish");
          } else {
            toast.error("Write something in your blog to publish it");
          }
        })
        .catch((err) => {
          toast.error("Error saving content");
          console.error(err);
        });
    }
  };

  const handleSaveDraft = () => {
    if (loading) return;
    if (!title.trim())
      return toast.error("Write a blog title to save as a draft");

    const loadingToast = toast.loading("Saving Draft...");
    setLoading(true);

    if (textEditor) {
      textEditor.save().then((content) => {
        const blogObj = { title, banner, des, content, tags, draft: true };
        axios
          .post(
            `${import.meta.env.VITE_SERVER_DOMAIN}create-blog`,
            { ...blogObj, id: blog_id },
            {
              headers: { Authorization: `Bearer ${access_token}` },
            }
          )
          .then(() => {
            toast.dismiss(loadingToast);
            toast.success("Saved as Draft");
            setTimeout(() => navigate("/dashboard/blogs?tab=draft"), 1000);
          })
          .catch(({ response }) => {
            toast.dismiss(loadingToast);
            toast.error(response?.data?.error || "Error saving draft");
          })
          .finally(() => setLoading(false));
      });
    }
  };

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="flex-none w-10">
          <img src={logo} alt="Logo" />
        </Link>
        <p className="max-md:hidden text-black line-clamp-1 w-full">
          {title || "New Blog"}
        </p>

        <div className="flex gap-4 ml-auto">
          <button className="btn-dark py-2" onClick={handlePublishEvent}>
            Publish
          </button>
          <button className="btn-light py-2" onClick={handleSaveDraft}>
            Save Draft
          </button>
        </div>
      </nav>

      <Toaster />
      <AnimationWrapper>
        <section>
          <div className="mx-auto max-w-[900px] w-full">
            <div className="relative aspect-video hover:opacity-80 bg-white border-4 border-grey">
              <label htmlFor="uploadBanner">
                <img
                  src={banner || defaultBanner}
                  alt="Blog Banner"
                  onError={handleError}
                  className="w-full h-full object-cover"
                />
                <input
                  id="uploadBanner"
                  type="file"
                  accept=".png, .jpg, .jpeg"
                  hidden
                  onChange={handleBannerUpload}
                />
              </label>
            </div>
            <textarea
              defaultValue={title}
              placeholder="Blog Title"
              className="text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40"
              onChange={handleTitleChange}
            />
            <hr className="w-full opacity-60 my-5" />
            <div id="textEditor" className="font-gelasio"></div>
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default BlogEditor;
