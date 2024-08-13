import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { Navigate, useParams } from "react-router-dom";
import BlogEditor from "../components/blog-editor.component";
import PublishForm from "../components/publish-form.component";
import { createContext } from "react";
import Loader from "../components/loader.component";
import axios from "axios";

const blogStructure = {
  title: "",
  banner: "",
  content: [],
  tags: [],
  des: "",
  author: { personal_info: {} },
};

export const EditorContext = createContext({
  blog: blogStructure,
  setBlog: () => {},
  editorState: "editor",
  setEditorState: () => {},
  textEditor: { isReady: false },
  setTextEditor: () => {},
});

const Editor = () => {
  let { blog_id } = useParams();
  const [blog, setBlog] = useState(blogStructure);
  const [editorState, setEditorState] = useState("editor");
  const [textEditor, setTextEditor] = useState({ isReady: false });
  const { userAuth } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const access_token = userAuth?.access_token;

  useEffect(() => {
    if (!blog_id) {
      setLoading(false);
      return;
    }
    axios
      .post(`${import.meta.env.VITE_SERVER_DOMAIN}get-blog`, {
        blog_id,
        draft: true,
        mode: "edit",
      })
      .then(({ data: { blog } }) => {
        setBlog(blog);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, [blog_id]);

  return (
    <EditorContext.Provider
      value={{
        blog,
        setBlog,
        editorState,
        setEditorState,
        textEditor,
        setTextEditor,
      }}
    >
      {access_token ? (
        loading ? (
          <Loader />
        ) : editorState === "editor" ? (
          <BlogEditor />
        ) : (
          <PublishForm />
        )
      ) : (
        <Navigate to="/signin" />
      )}
    </EditorContext.Provider>
  );
};

export default Editor;
