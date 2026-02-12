import { useState, useEffect } from "react";

const API = "https://gr-backend.ajinstellus8.workers.dev";

function App() {
  const [text, setText] = useState("");
  const [qrList, setQrList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch existing QR codes
  const fetchQRs = async () => {
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
    fetchQRs();
  }, []);

  // Generate QR
  const generateQR = async () => {
    if (!text.trim()) return alert("Enter some text");

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
      fetchQRs();

    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete QR
  const deleteQR = async (id) => {
    try {
      const res = await fetch(`${API}/api/qr/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      fetchQRs();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>QR Code Generator 🚀</h1>

      <input
        type="text"
        placeholder="Enter text..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ padding: 10, width: 300 }}
      />

      <button
        onClick={generateQR}
        style={{ marginLeft: 10, padding: 10 }}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate"}
      </button>

      <hr style={{ margin: "30px 0" }} />

      <h2>Generated QRs</h2>

      {initialLoading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {qrList.map((qr) => (
        <div key={qr.id} style={{ marginBottom: 20 }}>
          <p><b>Data:</b> {qr.data}</p>

          <img
            src={qr.url || `https://pub-04739ba0915141ad846791d998083428.r2.dev/${qr.fileName}`}
            alt="QR"
            width="150"
          />

          <br />

          <button
            onClick={() => deleteQR(qr.id)}
            style={{ marginTop: 5 }}
          >
            Delete
          </button>

          <hr />
        </div>
      ))}
    </div>
  );
}

export default App;
