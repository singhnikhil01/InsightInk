import axios from "axios";

export const uploadImage = async (image) => {
  let imgUrl = null;
  await axios
    .get(import.meta.env.VITE_SERVER_DOMAIN + "get-upload-url")
    .then(async ({ data: { uploadUrl } }) => {
      await axios({
        method: "put",
        url: uploadUrl,
        headers: { "Content-Type": "multipart/form-data" },
        data: image,
      }).then(() => {
        imgUrl = uploadUrl.split("?")[0];
      });
    });

  return imgUrl;
};
