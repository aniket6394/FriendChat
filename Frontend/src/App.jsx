import { Routes, Route } from "react-router-dom";
import Home from "./page/Home";
import Room from "./page/Room";
import { QueryClientProvider } from "@tanstack/react-query";
import { query } from "./util/http";
export default function App() {
  return (
    <QueryClientProvider client={query}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:id" element={<Room />} />
      </Routes>
    </QueryClientProvider>
  );
}
