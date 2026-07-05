import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTrendingGifs, searchGifs } from "../util/http";
import { socket } from "../socket/socket";
import "./GifPicker.css";

export default function GifPicker({ roomId, username, close }) {
  const [search, setSearch] = useState("");

  const { data: trending, isLoading: trendingLoading } = useQuery({
    queryKey: ["trending-gifs"],
    queryFn: () => getTrendingGifs(username),
    staleTime: 1000 * 60 * 10,
  });

  const { data: searched, isLoading: searchLoading } = useQuery({
    queryKey: ["search-gifs", search],
    queryFn: () => searchGifs(username, search),
    enabled: search.trim().length > 0,
    staleTime: 1000 * 60 * 10,
  });

  // KLIPY returns: data -> data -> []
  const gifs =
    search.trim().length > 0
      ? searched?.data?.data || []
      : trending?.data?.data || [];

  function sendGif(gif) {
    socket.emit("send-gif", {
      roomId,
      username,
      gif: gif.file.hd.gif.url,
    });

    close();
  }

  return (
    <div className="gif-picker-overlay">
      <div className="gif-picker">
        <div className="gif-header">
          <h3>GIFs</h3>

          <button onClick={close}>✕</button>
        </div>

        <input
          className="gif-search"
          placeholder="Search GIF..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {(trendingLoading || searchLoading) && <p>Loading...</p>}

        <div className="gif-grid">
          {gifs.map((gif) => (
            <img
              key={gif.id}
              src={gif.file.hd.jpg.url}
              alt={gif.title}
              title={gif.title}
              onClick={() => sendGif(gif)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
