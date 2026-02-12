import { useState, useEffect } from "react";

const API = "https://YOUR-WORKER-URL.workers.dev";

function App() {
  const [text, setText] = useState("");
  const [qrList, setQrList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // ---------------------------
  // LOAD QR LIST
  // ---------------------------
  const loadQrs = async () => {
    try {
      const res = await fetch(`${API}/api/list`);

      if (!res.ok) throw new Error("Failed to fetch QRs");

      const data = await res.json();
      setQrList(data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadQrs();
  }, []);

  // ---------------------------
  // GENERATE
  // ---------------------------
  const generateQR = async () => {
    if (!text.trim()) return alert("Enter text");

    try {
      setLoading(true);

      const res = await fetch(`${API}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          data: text
        })
      });

      if (!res.ok) throw new Error("Generation failed");

      await res.json();

      setText("");

      // Because Queue inserts async, wait before reloading
      setTimeout(loadQrs, 1500);

    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // DELETE
  // ---------------------------
  const deleteQr = async (id) => {
    try {
      const res = await fetch(`${API}/api/qr/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Delete failed");

      loadQrs();

    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>QR Bulk System 🚀</h1>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text"
        style={{ padding: 8, width: 250 }}
      />

      <button
        onClick={generateQR}
        style={{ marginLeft: 10, padding: 8 }}
        disabled={loading}
      >
        {loading ? "Sending..." : "Generate"}
      </button>

      <hr />

      <h2>Latest QRs</h2>

      {initialLoading && <p>Loading...</p>}

      {qrList.map((qr) => (
        <div key={qr.id} style={{ marginBottom: 10 }}>
          <b>{qr.data}</b>

          <button
            style={{ marginLeft: 10 }}
            onClick={() => deleteQr(qr.id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;
