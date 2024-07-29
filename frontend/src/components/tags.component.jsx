import { useContext, useState } from "react";
import { EditorContext } from "../pages/editor.pages";

const Tag = ({ tag, tagIndex }) => {
  const {
    blog: { tags },
    setBlog,
  } = useContext(EditorContext);

  const [isEditable, setIsEditable] = useState(false);

  const handleTagDelete = () => {
    const newTags = tags.filter((_, index) => index !== tagIndex);
    setBlog((prevBlog) => ({
      ...prevBlog,
      tags: newTags,
    }));
  };

  const handleTagEdit = (e) => {
    if (e.keyCode === 13 || e.keyCode === 118) {
      e.preventDefault();
      const currentTag = e.target.innerText;
      const newTags = [...tags];
      newTags[tagIndex] = currentTag;
      setBlog((prevBlog) => ({
        ...prevBlog,
        tags: newTags,
      }));
      setIsEditable(false);
    }
  };

  const addEditable = () => {
    setIsEditable(true);
  };

  return (
    <div
      className="relative p-2 mt-2 mr-2 px-5 bg-white rounded-full
      inline-block hover:bg-opacity-50 pr-8"
    >
      <p
        className="outline-none"
        onClick={addEditable}
        suppressContentEditableWarning={true}
        contentEditable={isEditable}
        onKeyDown={handleTagEdit}
      >
        {tag}
      </p>
      <button
        className="mt-[2px] rounded-full absolute right-2 top-1/2 -translate-y-1/2"
        onClick={handleTagDelete}
      >
        <i className="fi fi-br-cross text-sm pointer-events-none"></i>
      </button>
    </div>
  );
};

export default Tag;
