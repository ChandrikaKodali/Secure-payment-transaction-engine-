import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

// =====================================================
// API CONFIG
// =====================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://secure-payment-engine-backend.onrender.com";

const API_KEY =
  import.meta.env.VITE_API_KEY ||
  "secure-payment-demo-2026";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// =====================================================
// LOGIN
// =====================================================

function LoginPage({ onLogin, onRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = (e) => {
    e.preventDefault();
    setError("");

    if (username === "admin" && password === "admin123") {
      onLogin(username);
    } else {
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo-circle">₹</div>

        <h1>Secure Payment Engine</h1>
        <p className="subtitle">Secure transaction management system</p>

        <form onSubmit={login}>
          <label>Username</label>

          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <div className="error-box">{error}</div>}

          <button className="primary-button" type="submit">
            Login
          </button>
        </form>

        <p className="switch-text">
          Don't have an account?
          <button onClick={onRegister} className="link-button">
            Register
          </button>
        </p>

        <div className="demo-box">
          <strong>Demo Login</strong>
          <p>Username: admin</p>
          <p>Password: admin123</p>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// REGISTER
// =====================================================

function RegisterPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const register = (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (username.length < 3) {
      setError("Username must contain at least 3 characters.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setMessage("Registration successful. Please login.");

    setTimeout(() => {
      onLogin();
    }, 1000);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo-circle">₹</div>

        <h1>Create Account</h1>
        <p className="subtitle">Register for Secure Payment Engine</p>

        <form onSubmit={register}>
          <label>Username</label>

          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label>Confirm Password</label>

          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && <div className="error-box">{error}</div>}

          {message && <div className="success-box">{message}</div>}

          <button className="primary-button" type="submit">
            Register
          </button>
        </form>

        <p className="switch-text">
          Already have an account?
          <button onClick={onLogin} className="link-button">
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

// =====================================================
// NAVBAR
// =====================================================

function Navbar({ page, setPage, username, logout }) {
  return (
    <header className="navbar">
      <div className="brand">
        <div className="brand-icon">₹</div>
        <div>
          <h2>Secure Payment Engine</h2>
          <span>Transaction Management</span>
        </div>
      </div>

      <nav>
        <button
          className={page === "dashboard" ? "nav-active" : ""}
          onClick={() => setPage("dashboard")}
        >
          Dashboard
        </button>

        <button
          className={page === "payment" ? "nav-active" : ""}
          onClick={() => setPage("payment")}
        >
          Make Payment
        </button>

        <button
          className={page === "transactions" ? "nav-active" : ""}
          onClick={() => setPage("transactions")}
        >
          Transactions
        </button>

        <button
          className={page === "reconciliation" ? "nav-active" : ""}
          onClick={() => setPage("reconciliation")}
        >
          Reconciliation
        </button>
      </nav>

      <div className="user-section">
        <span>Hi, {username}</span>

        <button className="logout-button" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}

// =====================================================
// DASHBOARD
// =====================================================

function DashboardPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/payments", {
        headers: {
          "X-API-Key": API_KEY,
        },
      });

      setPayments(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to connect to payment backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const successful = payments.filter(
    (p) => p.status === "SUCCESS"
  ).length;

  const pending = payments.filter(
    (p) => p.status === "PENDING"
  ).length;

  const failed = payments.filter(
    (p) => p.status === "FAILED"
  ).length;

  const totalAmount = payments.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your payment transactions</p>
        </div>

        <button
          className="secondary-button"
          onClick={loadPayments}
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="error-box dashboard-error">
          {error}
        </div>
      )}

      <div className="system-card">
        <div className="online-dot"></div>

        <div>
          <strong>System Status</strong>
          <p>{error ? "Backend unavailable" : "Backend connected"}</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">↔</div>
          <p>Total Transactions</p>
          <h2>{loading ? "..." : payments.length}</h2>
        </div>

        <div className="stat-card">
          <div className="stat-icon success-icon">✓</div>
          <p>Successful</p>
          <h2>{loading ? "..." : successful}</h2>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending-icon">◷</div>
          <p>Pending</p>
          <h2>{loading ? "..." : pending}</h2>
        </div>

        <div className="stat-card">
          <div className="stat-icon failed-icon">×</div>
          <p>Failed</p>
          <h2>{loading ? "..." : failed}</h2>
        </div>
      </div>

      <div className="amount-card">
        <p>Total Transaction Amount</p>
        <h2>
          ₹
          {totalAmount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          })}
        </h2>
      </div>

      <div className="card">
        <div className="card-heading">
          <div>
            <h2>Recent Transactions</h2>
            <p>Latest payment activity</p>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading transactions...</div>
        ) : payments.length === 0 ? (
          <div className="empty">
            No payment transactions found.
          </div>
        ) : (
          <TransactionTable payments={payments} />
        )}
      </div>
    </div>
  );
}

// =====================================================
// TRANSACTION TABLE
// =====================================================

function TransactionTable({ payments }) {
  return (
    <div className="table-wrapper">
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
          {payments.map((payment) => (
            <tr key={payment.transaction_id}>
              <td className="transaction-id">
                {payment.transaction_id}
              </td>

              <td>
                {Number(payment.amount).toLocaleString("en-IN")}
              </td>

              <td>{payment.currency}</td>

              <td>
                <span
                  className={`status ${String(
                    payment.status
                  ).toLowerCase()}`}
                >
                  {payment.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// =====================================================
// MAKE PAYMENT
// =====================================================

function PaymentPage() {
  const [transactionId, setTransactionId] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("INR");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const createPayment = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

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

      setMessage(
        `Payment created successfully: ${response.data.transaction_id}`
      );

      setTransactionId("");
      setAmount("");
      setCurrency("INR");
    } catch (err) {
      console.error("Payment error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to create payment."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>Make Payment</h1>
          <p>Create a new secure payment transaction</p>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={createPayment}>
          <label>Transaction ID</label>

          <input
            type="text"
            placeholder="Example: TXN1005"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            required
          />

          <label>Amount</label>

          <input
            type="number"
            min="1"
            step="0.01"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <label>Currency</label>

          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="INR">INR - Indian Rupee</option>
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
          </select>

          {error && <div className="error-box">{error}</div>}

          {message && (
            <div className="success-box">{message}</div>
          )}

          <button
            className="primary-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Processing..." : "Create Payment"}
          </button>
        </form>
      </div>
    </div>
  );
}

// =====================================================
// TRANSACTIONS PAGE
// =====================================================

function TransactionsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/payments", {
        headers: {
          "X-API-Key": API_KEY,
        },
      });

      setPayments(response.data);
    } catch (err) {
      console.error("Transactions error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load transactions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>Transactions</h1>
          <p>View all payment transactions</p>
        </div>

        <button
          className="secondary-button"
          onClick={loadTransactions}
        >
          ↻ Refresh
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="card">
        {loading ? (
          <div className="loading">
            Loading transactions...
          </div>
        ) : payments.length === 0 ? (
          <div className="empty">
            No transactions found.
          </div>
        ) : (
          <TransactionTable payments={payments} />
        )}
      </div>
    </div>
  );
}

// =====================================================
// RECONCILIATION
// =====================================================

function ReconciliationPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/payments", {
          headers: {
            "X-API-Key": API_KEY,
          },
        });

        setPayments(response.data);
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.detail ||
            "Unable to load reconciliation data."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const successful = payments.filter(
    (p) => p.status === "SUCCESS"
  );

  const pending = payments.filter(
    (p) => p.status === "PENDING"
  );

  const failed = payments.filter(
    (p) => p.status === "FAILED"
  );

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>Reconciliation</h1>
          <p>Payment transaction reconciliation</p>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      {loading ? (
        <div className="loading">
          Loading reconciliation...
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <p>Total</p>
              <h2>{payments.length}</h2>
            </div>

            <div className="stat-card">
              <p>Successful</p>
              <h2>{successful.length}</h2>
            </div>

            <div className="stat-card">
              <p>Pending</p>
              <h2>{pending.length}</h2>
            </div>

            <div className="stat-card">
              <p>Failed</p>
              <h2>{failed.length}</h2>
            </div>
          </div>

          <div className="card">
            <h2>Reconciliation Summary</h2>

            <div className="reconciliation-row">
              <span>Successful transactions</span>
              <strong>{successful.length}</strong>
            </div>

            <div className="reconciliation-row">
              <span>Pending transactions</span>
              <strong>{pending.length}</strong>
            </div>

            <div className="reconciliation-row">
              <span>Failed transactions</span>
              <strong>{failed.length}</strong>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// =====================================================
// MAIN APP
// =====================================================

function App() {
  const [page, setPage] = useState("login");
  const [username, setUsername] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const login = (user) => {
    setUsername(user);
    setLoggedIn(true);
    setPage("dashboard");
  };

  const logout = () => {
    setUsername("");
    setLoggedIn(false);
    setPage("login");
  };

  if (!loggedIn) {
    if (page === "register") {
      return (
        <RegisterPage
          onLogin={() => setPage("login")}
        />
      );
    }

    return (
      <LoginPage
        onLogin={login}
        onRegister={() => setPage("register")}
      />
    );
  }

  return (
    <div className="app">
      <Navbar
        page={page}
        setPage={setPage}
        username={username}
        logout={logout}
      />

      <main>
        {page === "dashboard" && <DashboardPage />}
        {page === "payment" && <PaymentPage />}
        {page === "transactions" && <TransactionsPage />}
        {page === "reconciliation" && <ReconciliationPage />}
      </main>
    </div>
  );
}

export default App;