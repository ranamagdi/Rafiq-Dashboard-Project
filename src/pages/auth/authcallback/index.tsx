import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCookie } from "../../../hooks/useCookie";

const AuthCallback = () => {
  const navigate = useNavigate();
  const ran = useRef(false);
  const { setCookie,getCookie} = useCookie();
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
   const existingAccessToken = getCookie("access_token");
  
     if (existingAccessToken) {
      navigate("/dashboard", { replace: true });
      return;
    }

    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace("#", ""));

    const accessToken = params.get("access_token");
    const type = params.get("type");

    const error = params.get("error");
    const errorCode = params.get("error_code");

    console.log("AuthCallback URL:", window.location.href);
    console.log("access_token:", accessToken);
    console.log("type:", type);

    if (error || errorCode) {
      navigate(`/reset-password?error=${errorCode || "invalid_link"}`, {
        replace: true,
      });
      return;
    }

    if (type === "recovery" && accessToken) {
   
      setCookie("access_token", accessToken);
  

      navigate(
        `/reset-password?access_token=${accessToken}&type=recovery`,
        { replace: true }
      );
      return;
    }

    navigate("/login", { replace: true });
  }, [getCookie, navigate, setCookie]);

  return null;
};

export default AuthCallback;