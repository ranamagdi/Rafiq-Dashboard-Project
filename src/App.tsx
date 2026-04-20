import "./App.css";
import AppRoutes from "./routes";
import Header from "./components/common/Header/Header";
import { useEffect, useRef } from "react";
import { useAppDispatch } from "./hooks/reduxHooks";
import { fetchUser } from "./store/slices/user/userSlice";
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

    dispatch(fetchUser());
  }, [dispatch, token]);


  return (
    <div className="App">
      <Header />
      <AppRoutes />
    </div>
  );
}

export default App;