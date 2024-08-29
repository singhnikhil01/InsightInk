import { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import { toast, Toaster } from "react-hot-toast";
import { UserContext } from "../App";
import axios from "axios";

const ChangePassword = () => {
  const ChangePasswordForm = useRef();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Initialize navigate

  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(ChangePasswordForm.current);
    const formData = {};
    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    const { CurrentPassword, NewPassword } = formData;

    // Validate fields
    if (!CurrentPassword || !NewPassword) {
      return toast.error("Both fields are required.");
    }

    if (CurrentPassword === NewPassword) {
      return toast.error(
        "New Password should be different from the Current Password."
      );
    }

    if (!passwordRegex.test(NewPassword)) {
      return toast.error(
        "Password should be 6 to 20 characters long with a numeric, lowercase, and uppercase letter."
      );
    }

    setLoading(true);
    let loadingToast = toast.loading("Updating...");

    try {
      await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}change-password`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      toast.dismiss(loadingToast);
      toast.success("Password changed successfully.");

      // Navigate to home after success
      navigate("/");
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.error || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimationWrapper>
      <Toaster />
      <form
        ref={ChangePasswordForm}
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto mt-20"
      >
        <h1 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Change Password
        </h1>
        <div className="space-y-4">
          <InputBox
            name="CurrentPassword"
            type="password"
            className="profile-edit-input"
            icon="fi-rr-unlock"
            placeholder="Current Password"
          />
          <InputBox
            name="NewPassword"
            type="password"
            className="profile-edit-input"
            icon="fi-rr-unlock"
            placeholder="New Password"
          />
          <button
            className={`btn-dark w-full py-3 text-white ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            type="submit"
            disabled={loading}
          >
            {loading ? "Changing..." : "Change Password"}
          </button>
        </div>
      </form>
    </AnimationWrapper>
  );
};

export default ChangePassword;
