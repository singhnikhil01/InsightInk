import { Link } from "react-router-dom";
import logo from "../imgs/logo.png";
import { Toaster, toast } from "react-hot-toast";
import AnimationWrapper from "../common/page-animation";
import { useContext } from "react";
import { EditorContext } from "../pages/editor.pages";

const PublishForm = () => {
  let {
    blog: { banner, title, tags, des },
    setEditorState,
  } = useContext(EditorContext);

  const handleCloseEvent = () => {
    setEditorState("editor");
  };

  return (
    <AnimationWrapper>
      <section className="w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4">
        <Toaster />
        <button
          className=" w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]"
          onClick={handleCloseEvent}
        >
          <i className="fi fi-br-cross"></i>
        </button>

        <div className="max-w-[550px] center">
          <p className="text-dark-grey mb-1">Preview</p>
          <div className="w-full aspect-video  rounded-lg overflow-hidden bg-grey mt-4">
            <img src={banner} />
          </div>

          <h1 className="text-4xl font-medium mt-2 leading-tight line-clamp-2">
            {title}
          </h1>

          <p className="font-gelasio line-clamp-2 text-2xl leading-7 mt-4">
            {des}
          </p>

          <div className="border-grey lg:pl-8">
            <p>Blog Title</p>
            <input type="text" placeholder="Blog Title" defaultValue={title} />
          </div>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default PublishForm;
