import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCookie } from "../../../hooks/useCookie";

const AuthCallback = () => {
  const navigate = useNavigate();
  const ran = useRef(false);
  const { setCookie, getCookie } = useCookie();

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    console.log("AuthCallback running:", window.location.href);

    // 1. Parse URL hash
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace("#", ""));

    const accessToken = params.get("access_token");
    const type = params.get("type");

    const error = params.get("error");
    const errorCode = params.get("error_code");

    // 2. Handle error case
    if (error || errorCode) {
      navigate(`/reset-password?error=${errorCode || "invalid_link"}`, {
        replace: true,
      });
      return;
    }

    // 3. If token exists → save it
    if (accessToken) {
      setCookie("access_token", accessToken);
    }

    // 4. Redirect back to original page (invite, etc.)
    const redirectTo = sessionStorage.getItem("redirect_after_login");

    if (redirectTo) {
      sessionStorage.removeItem("redirect_after_login");
      navigate(redirectTo, { replace: true });
      return;
    }

    // 5. Recovery flow (if needed)
    if (type === "recovery" && accessToken) {
      navigate(
        `/reset-password?access_token=${accessToken}&type=recovery`,
        { replace: true }
      );
      return;
    }

    // 6. Already logged in safety check
    const existingToken = getCookie("access_token");

    if (existingToken) {
      navigate("/dashboard", { replace: true });
      return;
    }

    // 7. Default fallback
    navigate("/login", { replace: true });
  }, [navigate, setCookie, getCookie]);

  return null;
};

export default AuthCallback;