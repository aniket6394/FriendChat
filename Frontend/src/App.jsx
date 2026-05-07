import { Routes, Route } from "react-router-dom";
import Home from "./page/Home";
import { useEffect } from "react";
import Room from "./page/Room";
import { QueryClientProvider } from "@tanstack/react-query";
import { query } from "./util/http";
import { useLocation, useNavigate } from "react-router-dom";
export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  // useEffect(() => {
  //   const navEntry = performance.getEntriesByType("navigation")[0];

  //   if (navEntry?.type === "reload" && location.pathname !== "/") {
  //     navigate("/", { replace: true });
  //   }
  // }, []);
  return (
    <QueryClientProvider client={query}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:id" element={<Room />} />
      </Routes>
    </QueryClientProvider>
  );
}
