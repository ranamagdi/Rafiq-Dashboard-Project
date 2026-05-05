import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Logo from "/favicon.svg";
import { acceptInvitation } from "../../services/endpoints";
import toast from "react-hot-toast";
import { AcceptInvite } from "../../components/ui/SvgIcons";
import { useCookie } from "../../hooks/useCookie";
import type { ApiError } from "../../types/apiTypes";

export default function AcceptInvetation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getCookie } = useCookie();

  const token = new URLSearchParams(location.search).get("token");
  const isLoggedIn = !!getCookie("access_token");

  useEffect(() => {
    if (token) {
      sessionStorage.setItem("invite_token", token);
    }

    if (!isLoggedIn) {
      sessionStorage.setItem(
        "redirect_after_login",
        location.pathname + location.search,
      );

      navigate("/login", { replace: true });
      return;
    }
  }, [isLoggedIn, token, navigate, location]);
  const handleAccept = async () => {
    const finalToken = sessionStorage.getItem("invite_token");

    if (!finalToken) {
      toast.error("Invalid invitation link");
      return;
    }

    try {
      await acceptInvitation(finalToken);

      toast.success("Invitation accepted!", {
        duration: 3000,
      });

      sessionStorage.removeItem("invite_token");

      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (err: unknown) {
      const error = err as ApiError;

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to accept invitation";

      toast.error(message);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: `
          linear-gradient(0deg, #F9F9FF, #F9F9FF),
          radial-gradient(141.42% 141.42% at 100% 100%, #F1F3FF 0%, rgba(241, 243, 255, 0) 50%),
          radial-gradient(141.42% 141.42% at 0% 0%, #D7E2FF 0%, rgba(215, 226, 255, 0) 50%)
        `,
      }}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-2">
          <img src={Logo} alt="Logo" className="w-6 h-6" />
          <span className="logo-name">TASKLY</span>
        </div>

        <div className="md:w-xl  bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center relative overflow-hidden">
          <div
            className="absolute top-0 left-0 w-full h-1"
            style={{
              background: "linear-gradient(90deg, #003D9B 0%, #0052CC 100%)",
            }}
          />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-(--color-surface-highest) text-xs text-(--color-forms-texts) mb-4">
            <AcceptInvite />
            NEW PROJECT INVITATION
          </div>

          <h2 className="text-[30px] font-semibold text-slate-900 mb-6">
            You've been invited to join new project
          </h2>

          <Button className="w-full" onClick={handleAccept}>
            Accept Invitation
          </Button>
        </div>
      </div>
    </div>
  );
}
