import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";
import { profileDataStructure } from "./profile.page";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { Toaster, toast } from "react-hot-toast";
import InputBox from "../components/input.component";
import { uploadImage } from "../common/aws";
import { storeInSession } from "../common/session";

const EditProfilePage = () => {
  let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  const {
    userAuth: { access_token },
    userAuth,
    setUserAuth,
  } = useContext(UserContext);
  const bioLimit = 150;

  const [profile, setProfile] = useState(profileDataStructure);
  const [loading, setLoading] = useState(true);
  const [charactersLeft, setCharactersLeft] = useState(bioLimit);
  const [updatedProfileImg, setupdatedProfileImg] = useState(null);
  const profileImageEle = useRef();
  const editprofileform = useRef();

  const {
    personal_info: {
      fullname,
      username: profile_username,
      profile_img,
      email,
      bio,
    },
    social_links,
  } = profile;

  useEffect(() => {
    axios
      .post(`${import.meta.env.VITE_SERVER_DOMAIN}get-profile`, {
        username: userAuth.username,
      })
      .then(({ data }) => {
        setProfile(data);
        setLoading(false);
      });
  }, [access_token, userAuth.username]);

  const handleCharacterChange = (e) => {
    setCharactersLeft(bioLimit - e.target.value.length);
    setProfile({
      ...profile,
      personal_info: {
        ...profile.personal_info,
        bio: e.target.value,
      },
    });
  };

  const handleImgPreview = (e) => {
    let img = e.target.files[0];
    profileImageEle.current.src = URL.createObjectURL(img);
    setupdatedProfileImg(img);
  };

  const handleImgUpload = async (e) => {
    e.preventDefault();

    if (!updatedProfileImg) return;

    let loadingToast = toast.loading("Uploading...");
    e.target.setAttribute("disabled", true);

    try {
      const url = await uploadImage(updatedProfileImg);

      if (url) {
        const { data } = await axios.post(
          `${import.meta.env.VITE_SERVER_DOMAIN}update-profile-img`,
          { url },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );

        let newUserAuth = {
          ...userAuth,
          profile_img: data.profile_img,
        };

        storeInSession("user", JSON.stringify(newUserAuth));
        setUserAuth(newUserAuth);
        setupdatedProfileImg(null);
        toast.success("Uploaded");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Something went wrong!";
      console.error(error);
      toast.error(errorMsg);
    } finally {
      toast.dismiss(loadingToast);
      e.target.removeAttribute("disabled");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let form = new FormData(editprofileform.current);
    let formData = {};
    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    let {
      fullname,
      username,
      bio,
      youtube,
      facebook,
      twitter,
      github,
      instagram,
      website,
    } = formData;

    const bioLimit = 150;
    if (fullname && fullname.length < 3) {
      return toast.error("Full name must be at least 3 characters long");
    }

    if (username && username.length < 3) {
      return toast.error("Username must be at least 3 characters long");
    }

    if (bio && bio.length > bioLimit) {
      return toast.error(`Bio must be less than ${bioLimit} characters long`);
    }

    let social_links = {
      youtube,
      facebook,
      twitter,
      github,
      instagram,
      website,
    };

    let loadingToast = toast.loading("Uploading...");
    e.target.setAttribute("disabled", true);

    axios
      .post(
        `${import.meta.env.VITE_SERVER_DOMAIN}update-profile`,
        {
          fullname,
          username,
          bio,
          social_links,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(({ data }) => {
        console.log(data);
        if (userAuth.username !== data.username) {
          let newUserAuth = { ...userAuth, username: data.username };
          storeInSession("user", JSON.stringify(newUserAuth));
          setUserAuth(newUserAuth);
        }
        toast.success("Profile Updated");
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.response?.data?.error || "Something went wrong!");
      })
      .finally(() => {
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
      });
  };

  return (
    <AnimationWrapper className="mt-10">
      {loading ? (
        <Loader />
      ) : (
        <form ref={editprofileform}>
          <Toaster />
          <h1 className="text-2xl font-semibold mb-6 text-center text-gray-800 max-md:hidden">
            Edit Profile
          </h1>

          <div className="flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10">
            <div className="max-lg:center mb-5">
              <label
                htmlFor="uploadImg"
                id="profileImgLabel"
                className="relative block w-48 h-48 bg-grey rounded-full overflow-hidden border border-black"
              >
                <div
                  className="w-full h-full absolute top-0 left-0 flex items-center justify-center bg-black/30
                  opacity-0 hover:opacity-100"
                >
                  Upload Image
                </div>
                <img src={profile_img} ref={profileImageEle} alt="Profile" />
              </label>
              <input
                type="file"
                id="uploadImg"
                accept=".png, .jpg , .jpeg"
                hidden
                onChange={handleImgPreview}
              />

              <button
                className="btn-light mt-5 max-lg:center lg:w-full px-10"
                type="button"
                onClick={handleImgUpload}
              >
                Upload
              </button>
            </div>
            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-5">
                <div>
                  <InputBox
                    name="fullname"
                    type="text"
                    icon="fi-rr-user"
                    value={fullname}
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <InputBox
                    name="Email"
                    type="email"
                    icon="fi-rr-envelope"
                    value={email}
                    placeholder="Email"
                    disable={true}
                  />
                </div>
              </div>
              <InputBox
                type="text"
                name="username"
                value={profile_username}
                placeholder="Username"
                icon="fi-rr-at"
              />
              <p className="text-dark-grey mt-3">
                Username will be used to search for users and will be visible to
                all users
              </p>

              <textarea
                name="bio"
                maxLength={bioLimit}
                value={bio}
                className="input-box h-64 lg:h-40 resize-none leading-7 mt-5 pl-5"
                placeholder="Bio"
                onChange={handleCharacterChange}
              ></textarea>
              <p className="text-right text-gray-600 mt-1">
                {charactersLeft} Characters Left
              </p>

              <p className="my-6 text-dark-grey">
                Add your Social Handles Below
              </p>
              <div className="md:grid md:grid-cols-2 gap-x-6">
                {Object.keys(social_links).map((key, i) => {
                  let link = social_links[key];
                  return (
                    <InputBox
                      key={i}
                      name={key}
                      type="text"
                      value={link}
                      placeholder="https://"
                      icon={`fi ${
                        key !== "website" ? `fi-brands-${key}` : "fi-rr-globe"
                      } text-2xl hover:text-black`}
                    />
                  );
                })}
              </div>
              <button
                className="btn-dark w-auto px-10"
                type="submit"
                onClick={handleSubmit}
              >
                Update
              </button>
            </div>
          </div>
        </form>
      )}
    </AnimationWrapper>
  );
};
export default EditProfilePage;
