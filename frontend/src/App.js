import React, { useState } from "react";
import axios from "axios";

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const searchProducts = async () => {
    const response = await axios.get(`http://localhost:8000/search?query=${query}`);
    setResults(response.data.results);
  };

  return (
    <div>
      <input type="text" onChange={(e) => setQuery(e.target.value)} placeholder="Search for products..." />
      <button onClick={searchProducts}>Search</button>
      <ul>
        {results.map((item, index) => (
          <li key={index}>{item._source.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;

