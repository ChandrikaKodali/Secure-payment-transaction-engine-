import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://secure-payment-engine-backend.onrender.com";

const API_KEY =
  import.meta.env.VITE_API_KEY || "secure-payment-demo-2026";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

function App() {
  const [page, setPage] = useState("login");
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState("Checking...");
  const [error, setError] = useState("");

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const [transactionId, setTransactionId] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [paymentMessage, setPaymentMessage] = useState("");

  const authHeaders = {
    "X-API-Key": API_KEY,
  };

  const loadPayments = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/payments", {
        headers: authHeaders,
      });

      setPayments(response.data);
      setBackendStatus("Online");
    } catch (err) {
      console.error(err);
      setBackendStatus("Offline");
      setError(
        "Unable to connect to payment backend. Please check the backend API and database."
      );
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const checkBackend = async () => {
    try {
      await api.get("/health");
      setBackendStatus("Online");
    } catch (err) {
      console.error(err);
      setBackendStatus("Offline");
    }
  };

  useEffect(() => {
    checkBackend();
  }, []);

  useEffect(() => {
    if (loggedIn && page === "dashboard") {
      loadPayments();
    }
  }, [loggedIn, page]);

  const handleLogin = (e) => {
    e.preventDefault();

    if (loginUsername === "admin" && loginPassword === "admin123") {
      setUsername("admin");
      setLoggedIn(true);
      setPage("dashboard");
      setError("");
    } else {
      alert("Invalid username or password");
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();

    if (!registerUsername || !registerPassword) {
      alert("Please enter username and password");
      return;
    }

    alert("Registration successful. You can now login.");
    setPage("login");
    setLoginUsername(registerUsername);
    setLoginPassword("");
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setUsername("");
    setPage("login");
    setPayments([]);
  };

  const createPayment = async (e) => {
    e.preventDefault();
    setPaymentMessage("");

    if (!transactionId || !amount) {
      setPaymentMessage("Please enter transaction ID and amount.");
      return;
    }

    try {
      const response = await api.post(
        "/payments",
        {
          transaction_id: transactionId,
          amount: Number(amount),
          currency: currency,
          status: "PENDING",
        },
        {
          headers: {
            "X-API-Key": API_KEY,
            "Idempotency-Key": transactionId,
          },
        }
      );

      setPaymentMessage(
        `Payment ${response.data.transaction_id} created successfully.`
      );

      setTransactionId("");
      setAmount("");
      setCurrency("INR");

      await loadPayments();
    } catch (err) {
      console.error(err);

      if (err.response?.data?.detail) {
        setPaymentMessage(`Error: ${err.response.data.detail}`);
      } else {
        setPaymentMessage("Failed to create payment.");
      }
    }
  };

  const updatePaymentStatus = async (id, status) => {
    try {
      await api.put(
        `/payments/${id}/status`,
        {
          status: status,
        },
        {
          headers: authHeaders,
        }
      );

      await loadPayments();
    } catch (err) {
      console.error(err);

      if (err.response?.data?.detail) {
        alert(err.response.data.detail);
      } else {
        alert("Unable to update payment status.");
      }
    }
  };

  const totalAmount = payments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  );

  const successfulPayments = payments.filter(
    (payment) => payment.status === "SUCCESS"
  ).length;

  const pendingPayments = payments.filter(
    (payment) => payment.status === "PENDING"
  ).length;

  const failedPayments = payments.filter(
    (payment) => payment.status === "FAILED"
  ).length;

  if (!loggedIn) {
    if (page === "register") {
      return (
        <div className="auth-page">
          <div className="auth-card">
            <h1>SecurePay</h1>
            <p className="subtitle">Create your account</p>

            <form onSubmit={handleRegister}>
              <label>Username</label>
              <input
                type="text"
                placeholder="Enter username"
                value={registerUsername}
                onChange={(e) => setRegisterUsername(e.target.value)}
              />

              <label>Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
              />

              <button type="submit">Register</button>
            </form>

            <p className="switch-text">
              Already have an account?
              <button
                className="link-button"
                onClick={() => setPage("login")}
              >
                Login
              </button>
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>SecurePay</h1>
          <p className="subtitle">
            Secure Payment Transaction Engine
          </p>

          <form onSubmit={handleLogin}>
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter username"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />

            <button type="submit">Login</button>
          </form>

          <div className="demo-login">
            <strong>Demo Login</strong>
            <p>Username: admin</p>
            <p>Password: admin123</p>
          </div>

          <p className="switch-text">
            Don't have an account?
            <button
              className="link-button"
              onClick={() => setPage("register")}
            >
              Register
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="navbar">
        <div className="logo">SecurePay</div>

        <nav>
          <button
            className={page === "dashboard" ? "active" : ""}
            onClick={() => setPage("dashboard")}
          >
            Dashboard
          </button>

          <button
            className={page === "payment" ? "active" : ""}
            onClick={() => setPage("payment")}
          >
            New Payment
          </button>

          <button
            className={page === "transactions" ? "active" : ""}
            onClick={() => setPage("transactions")}
          >
            Transactions
          </button>

          <button
            className={page === "reconciliation" ? "active" : ""}
            onClick={() => setPage("reconciliation")}
          >
            Reconciliation
          </button>
        </nav>

        <div className="user-section">
          <span>Hi, {username}</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <main className="main-content">
        {page === "dashboard" && (
          <>
            <div className="page-heading">
              <div>
                <h1>Payment Dashboard</h1>
                <p>Monitor your payment transactions</p>
              </div>

              <button onClick={loadPayments} className="refresh-button">
                Refresh
              </button>
            </div>

            <div className="status-card">
              <div>
                <span
                  className={
                    backendStatus === "Online"
                      ? "status-dot online"
                      : "status-dot offline"
                  }
                ></span>

                <strong>System Status: {backendStatus}</strong>
              </div>

              <span>
                Backend: {API_URL}
              </span>
            </div>

            {error && <div className="error-box">{error}</div>}

            <div className="stats-grid">
              <div className="stat-card">
                <span>Total Transactions</span>
                <strong>{payments.length}</strong>
              </div>

              <div className="stat-card">
                <span>Total Amount</span>
                <strong>₹{totalAmount.toFixed(2)}</strong>
              </div>

              <div className="stat-card">
                <span>Successful</span>
                <strong>{successfulPayments}</strong>
              </div>

              <div className="stat-card">
                <span>Pending</span>
                <strong>{pendingPayments}</strong>
              </div>

              <div className="stat-card">
                <span>Failed</span>
                <strong>{failedPayments}</strong>
              </div>
            </div>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>Recent Transactions</h2>
                  <p>Latest payment activity</p>
                </div>
              </div>

              {loading ? (
                <div className="empty-state">
                  Loading payments...
                </div>
              ) : payments.length === 0 ? (
                <div className="empty-state">
                  No payment transactions found.
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Transaction ID</th>
                        <th>Amount</th>
                        <th>Currency</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {payments.slice(0, 10).map((payment) => (
                        <tr key={payment.transaction_id}>
                          <td>{payment.transaction_id}</td>
                          <td>{payment.amount}</td>
                          <td>{payment.currency}</td>
                          <td>
                            <span
                              className={`badge ${payment.status.toLowerCase()}`}
                            >
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        {page === "payment" && (
          <section className="form-panel">
            <h1>Create Payment</h1>
            <p>Create a new secure payment transaction.</p>

            <form onSubmit={createPayment}>
              <label>Transaction ID</label>
              <input
                type="text"
                placeholder="Example: PAYMENT_001"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />

              <label>Amount</label>
              <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <label>Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>

              <button type="submit">Create Payment</button>
            </form>

            {paymentMessage && (
              <div className="message-box">{paymentMessage}</div>
            )}
          </section>
        )}

        {page === "transactions" && (
          <section className="panel">
            <div className="page-heading">
              <div>
                <h1>All Transactions</h1>
                <p>View and manage payment transactions</p>
              </div>

              <button onClick={loadPayments} className="refresh-button">
                Refresh
              </button>
            </div>

            {error && <div className="error-box">{error}</div>}

            {payments.length === 0 ? (
              <div className="empty-state">
                No transactions available.
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Amount</th>
                      <th>Currency</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.transaction_id}>
                        <td>{payment.transaction_id}</td>
                        <td>{payment.amount}</td>
                        <td>{payment.currency}</td>
                        <td>
                          <span
                            className={`badge ${payment.status.toLowerCase()}`}
                          >
                            {payment.status}
                          </span>
                        </td>
                        <td>
                          {payment.status === "PENDING" && (
                            <div className="action-buttons">
                              <button
                                onClick={() =>
                                  updatePaymentStatus(
                                    payment.transaction_id,
                                    "SUCCESS"
                                  )
                                }
                              >
                                Success
                              </button>

                              <button
                                onClick={() =>
                                  updatePaymentStatus(
                                    payment.transaction_id,
                                    "FAILED"
                                  )
                                }
                              >
                                Failed
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {page === "reconciliation" && (
          <section className="panel">
            <h1>Reconciliation</h1>
            <p>
              Payment reconciliation summary based on current transactions.
            </p>

            <div className="reconciliation-grid">
              <div>
                <span>Total Transactions</span>
                <strong>{payments.length}</strong>
              </div>

              <div>
                <span>Successful Payments</span>
                <strong>{successfulPayments}</strong>
              </div>

              <div>
                <span>Pending Payments</span>
                <strong>{pendingPayments}</strong>
              </div>

              <div>
                <span>Failed Payments</span>
                <strong>{failedPayments}</strong>
              </div>
            </div>

            <button
              className="refresh-button"
              onClick={loadPayments}
            >
              Refresh Reconciliation
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
