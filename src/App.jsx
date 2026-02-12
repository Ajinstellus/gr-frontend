import { useState, useEffect } from "react";

const API = "https://gr-backend.ajinstellus8.workers.dev";
const R2_BASE = "https://pub-04739ba0915141ad846791d998083428.r2.dev";

function App() {
  const [text, setText] = useState("");
  const [qrList, setQrList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  // ==========================
  // LOAD QR LIST
  // ==========================
  const loadQrs = async () => {
    try {
      const res = await fetch(`${API}/api/list`);

      if (!res.ok) {
        throw new Error("Failed to fetch QR list");
      }

      const data = await res.json();
      setQrList(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadQrs();
  }, []);

  // ==========================
  // GENERATE QR
  // ==========================
  const generateQR = async () => {
    if (!text.trim()) {
      return alert("Enter some text");
    }

    try {
      setLoading(true);

      const res = await fetch(`${API}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ data: text })
      });

      if (!res.ok) {
        throw new Error("QR generation failed");
      }

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

  // ==========================
  // DELETE QR
  // ==========================
  const deleteQr = async (id) => {
    try {
      const res = await fetch(`${API}/api/qr/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      loadQrs();

    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>QR Bulk System 🚀</h1>

      {/* INPUT SECTION */}
      <div style={{ marginBottom: "20px" }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text"
          style={{
            padding: "8px",
            width: "250px",
            marginRight: "10px"
          }}
        />

        <button
          onClick={generateQR}
          disabled={loading}
          style={{
            padding: "8px 12px",
            cursor: "pointer"
          }}
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>

      <hr />

      {/* LIST SECTION */}
      <h2>Latest QRs</h2>

      {initialLoading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {qrList.length === 0 && !initialLoading && (
        <p>No QRs found</p>
      )}

      {qrList.map((qr) => (
        <div
          key={qr.id}
          style={{
            marginBottom: "20px",
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            width: "300px"
          }}
        >
          <p><b>Text:</b> {qr.data}</p>

          {qr.fileName && (
            <img
              src={`${R2_BASE}/${qr.fileName}`}
              alt="QR Code"
              width="150"
              style={{ marginBottom: "10px" }}
            />
          )}

          <br />

          <button
            onClick={() => deleteQr(qr.id)}
            style={{
              padding: "6px 10px",
              backgroundColor: "#ff4d4f",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: "4px"
            }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;
