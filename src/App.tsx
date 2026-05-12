import "./App.css";
import AppRoutes from "./routes";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div className="App">
      <AppRoutes />
      <Toaster position="bottom-center" containerClassName="z-[11000]" />
    </div>
  );
}

export default App;
