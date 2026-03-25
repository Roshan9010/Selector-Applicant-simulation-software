import React, { useEffect, useState } from "react";
import api from "../api/api";

const Invitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");

  const load = async (opts = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: opts.page || page,
        per_page: opts.perPage || perPage,
      };
      if (opts.q !== undefined) params.q = opts.q;
      else if (q) params.q = q;

      const res = await api.get("/admin/invitations", { params });
      const data = res.data || {};
      setInvitations(data.invitations || []);
      setPage(data.page || params.page);
      setPerPage(data.per_page || params.per_page);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error(err);
      setError("Failed to load invitations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load({ page: 1, q });
  };

  const changePage = (newPage) => {
    setPage(newPage);
    load({ page: newPage });
  };

  if (loading)
    return <div style={{ padding: "2rem" }}>Loading invitations...</div>;
  if (error)
    return (
      <div style={{ padding: "2rem", color: "var(--error)" }}>{error}</div>
    );

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Sent Invitations</h1>

      <form
        onSubmit={onSearch}
        style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem" }}
      >
        <input
          placeholder="Search by email, subject, or token"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ padding: "0.5rem", flex: 1 }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Search
        </button>
        <select
          value={perPage}
          onChange={(e) => {
            setPerPage(Number(e.target.value));
            load({ page: 1, perPage: Number(e.target.value) });
          }}
          style={{ padding: "0.5rem" }}
        >
          <option value={5}>5 / page</option>
          <option value={10}>10 / page</option>
          <option value={25}>25 / page</option>
        </select>
      </form>

      {invitations.length === 0 ? (
        <p>No invitations found.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>To</th>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>
                  Subject
                </th>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Token</th>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>
                  Preview
                </th>
              </tr>
            </thead>
            <tbody>
              {invitations.map((inv, idx) => (
                <tr
                  key={idx}
                  style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <td style={{ padding: "0.5rem" }}>{inv.to}</td>
                  <td style={{ padding: "0.5rem" }}>{inv.subject}</td>
                  <td style={{ padding: "0.5rem", fontFamily: "monospace" }}>
                    {inv.token || "—"}
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                      {inv.body}
                    </pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
            <div>
              Page {page} / {totalPages} — {total} total
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
              <button onClick={() => changePage(1)} disabled={page === 1}>
                First
              </button>
              <button
                onClick={() => changePage(page - 1)}
                disabled={page === 1}
              >
                Prev
              </button>
              <button
                onClick={() => changePage(page + 1)}
                disabled={page >= totalPages}
              >
                Next
              </button>
              <button
                onClick={() => changePage(totalPages)}
                disabled={page >= totalPages}
              >
                Last
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invitations;
