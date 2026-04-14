import { useEffect } from "react";
import { useAppDispatch } from "../../hooks/reduxHooks";
import { setUserMetaData } from "../../features/user/userSlice";

const AuthInitializer = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) return;

    try {
      const parsedUser = JSON.parse(savedUser);
      dispatch(setUserMetaData(parsedUser));
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem("user");
    }
  }, [dispatch]);

  return null;
};

export default AuthInitializer;