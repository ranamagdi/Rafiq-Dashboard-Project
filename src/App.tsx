import "./App.css";
import AppRoutes from "./routes";
import Header from "./components/common/Header/Header";
import AuthInitializer from "./components/authInitializer";
function App() {
  return (
    <div className="App">
      <AuthInitializer />
      <Header />
      <AppRoutes />
    </div>
  );
}

export default App;
