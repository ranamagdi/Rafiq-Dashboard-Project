import "./App.css";
import AppRoutes from "./routes";
import Header from "./components/common/Header/Header";


import { useEffect, useRef } from "react";
import { getUser } from "./services/endpoints";
import { useAppDispatch } from "./hooks/reduxHooks";
import { setUserMetaData } from "./store/slices/user/userSlice";
import { useCookie } from "./hooks/useCookie";

function App() {
  const dispatch = useAppDispatch();
  const hasFetched = useRef(false);

  const { getCookie } = useCookie();
  const token = getCookie("access_token");

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    if (!token) return;

    const fetchUser = async () => {
      try {
        const res = await getUser();
        const user = res?.data || res;

        if (user?.user_metadata) {
          dispatch(setUserMetaData(user.user_metadata));
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    fetchUser();
  }, [dispatch, token]);

  return (
    <div className="App">
  
      <Header />
      <AppRoutes />
    </div>
  );
}

export default App;