import { useEffect } from "react";
import LandingPage from "./pages/LandingPage.jsx";
import { useAuthStore } from "./store/AuthStore.js";

function App() {
  const fetchMe = useAuthStore((state) => state.fetchMe);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);
  return <LandingPage />;
}

export default App;
