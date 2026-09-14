import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

/* =====================================================
   API CONFIGURATION
===================================================== */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": "securepay-demo-2026-key",
  },
});

/* =====================================================
   MAIN APP
===================================================== */

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");

  /* ===================================================
     LOGIN
  =================================================== */

  const handleLogin = (e) => {
    e.preventDefault();

    const username = e.target.username.value.trim();
    const password = e.target.password.value;

    if (username === "admin" && password === "admin123") {
      setLoggedIn(true);
      setActivePage("dashboard");
    } else {
      alert("Invalid username or password");
    }
  };

  /* ===================================================
     LOGIN PAGE
  =================================================== */

  if (!loggedIn) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="logo">₹</div>

          <h1>Secure Payment Engine</h1>

          <p className="subtitle">
            Secure • Reliable • Fast Payments
          </p>

          <form onSubmit={handleLogin}>
            <label htmlFor="username">Username</label>

            <input
              id="username"
              name="username"
              type="text"
              placeholder="Enter username"
              autoComplete="username"
              required
            />

            <label htmlFor="password">Password</label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter password"
              autoComplete="current-password"
              required
              className="password-input"
            />

            <button type="submit">LOGIN</button>
          </form>

          <p className="demo">
            Demo: admin / admin123
          </p>
        </div>
      </div>
    );
  }

  /* ===================================================
     LOGGED-IN APPLICATION
  =================================================== */

  return (
    <div className="app">

      {/* NAVBAR */}

      <header className="navbar">
        <div className="brand">
          <div className="brand-logo">₹</div>

          <div>
            <h2>SecurePay</h2>
            <span>Payment Transaction Engine</span>
          </div>
        </div>

        <button
          className="logout"
          onClick={() => setLoggedIn(false)}
        >
          Logout
        </button>
      </header>

      {/* MAIN LAYOUT */}

      <div className="layout">

        {/* SIDEBAR */}

        <aside className="sidebar">

          <button
            className={
              activePage === "dashboard"
                ? "active"
                : ""
            }
            onClick={() => setActivePage("dashboard")}
          >
            🏠 Dashboard
          </button>

          <button
            className={
              activePage === "payment"
                ? "active"
                : ""
            }
            onClick={() => setActivePage("payment")}
          >
            💳 Make Payment
          </button>

          <button
            className={
              activePage === "transactions"
                ? "active"
                : ""
            }
            onClick={() => setActivePage("transactions")}
          >
            📋 Transactions
          </button>

          <button
            className={
              activePage === "reconciliation"
                ? "active"
                : ""
            }
            onClick={() => setActivePage("reconciliation")}
          >
            🔄 Reconciliation
          </button>

        </aside>

        {/* CONTENT */}

        <main className="content">

          {activePage === "dashboard" && (
            <DashboardPage />
          )}

          {activePage === "payment" && (
            <PaymentPage />
          )}

          {activePage === "transactions" && (
            <TransactionsPage />
          )}

          {activePage === "reconciliation" && (
            <ReconciliationPage />
          )}

        </main>

      </div>

    </div>
  );
}

/* =====================================================
   DASHBOARD PAGE
===================================================== */

function DashboardPage() {

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* FETCH PAYMENTS */

  const fetchPayments = async () => {

    try {

      setError("");

      const response = await api.get("/payments");

      if (Array.isArray(response.data)) {
        setPayments(response.data);
      } else {
        setPayments([]);
      }

    } catch (err) {

      console.error(
        "Dashboard API error:",
        err
      );

      setError(
        "Unable to load payments from server."
      );

    } finally {

      setLoading(false);

    }
  };

  /* INITIAL LOAD + AUTO REFRESH */

  useEffect(() => {

    fetchPayments();

    const interval = setInterval(
      fetchPayments,
      5000
    );

    return () => clearInterval(interval);

  }, []);

  /* CALCULATE STATISTICS */

  const totalPayments = payments.length;

  const pendingPayments =
    payments.filter(
      (payment) =>
        String(payment.status).toUpperCase() ===
        "PENDING"
    ).length;

  const totalAmount =
    payments.reduce(
      (total, payment) =>
        total + Number(payment.amount || 0),
      0
    );

  /* FORMAT AMOUNT */

  const formatAmount = (amount) => {

    return new Intl.NumberFormat(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    ).format(amount);

  };

  return (
    <>

      <h1>Dashboard</h1>

      <p className="welcome">
        Welcome back, Admin 👋
      </p>

      {/* ERROR */}

      {error && (
        <div className="payment-message error-message">
          ✕ {error}
        </div>
      )}

      {/* STAT CARDS */}

      <div className="cards">

        <div className="stat-card">

          <span>Total Payments</span>

          <h2>
            {loading
              ? "..."
              : totalPayments}
          </h2>

          <p>
            Transactions processed
          </p>

        </div>

        <div className="stat-card">

          <span>Pending Payments</span>

          <h2>
            {loading
              ? "..."
              : pendingPayments}
          </h2>

          <p>
            Awaiting settlement
          </p>

        </div>

        <div className="stat-card">

          <span>Total Amount</span>

          <h2>
            {loading
              ? "..."
              : `₹${formatAmount(totalAmount)}`}
          </h2>

          <p>
            Payment volume
          </p>

        </div>

        <div className="stat-card">

          <span>System Status</span>

          <h2>
            {error
              ? "Offline"
              : "Healthy"}
          </h2>

          <p>
            {error
              ? "Backend unavailable"
              : "All services operational"}
          </p>

        </div>

      </div>

      {/* RECENT TRANSACTIONS */}

      <div className="section">

        <h2>
          Recent Transactions
        </h2>

        {loading ? (

          <p>
            Loading transactions...
          </p>

        ) : payments.length === 0 ? (

          <p>
            No payments found.
          </p>

        ) : (

          <table>

            <thead>

              <tr>
                <th>ID</th>
                <th>Transaction</th>
                <th>Amount</th>
                <th>Currency</th>
                <th>Status</th>
              </tr>

            </thead>

            <tbody>

              {payments
                .slice(0, 10)
                .map((payment) => (

                  <tr key={payment.id}>

                    <td>
                      {payment.id}
                    </td>

                    <td>
                      {payment.transaction_id}
                    </td>

                    <td>
                      {payment.currency === "INR"
                        ? "₹"
                        : ""}

                      {Number(
                        payment.amount || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td>
                      {payment.currency}
                    </td>

                    <td>
                      <span className="status">
                        {payment.status}
                      </span>
                    </td>

                  </tr>

                ))}

            </tbody>

          </table>

        )}

      </div>

    </>
  );
}

/* =====================================================
   PAYMENT PAGE
===================================================== */

function PaymentPage() {

  const [transactionId, setTransactionId] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [currency, setCurrency] =
    useState("INR");

  const [idempotencyKey, setIdempotencyKey] =
    useState("");

  const [apiKey, setApiKey] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  /* CREATE PAYMENT */

  const handlePayment = async (e) => {

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
        },
        {
          headers: {
            "Idempotency-Key": idempotencyKey,
            "X-API-Key":
              apiKey || "securepay-demo-2026-key",
          },
        }
      );

      setMessage(
        response.data?.idempotent_replay
          ? `Payment already exists. Payment ID: ${response.data.payment_id}`
          : `Payment created successfully! Payment ID: ${response.data.payment_id}`
      );

      setTransactionId("");
      setAmount("");
      setIdempotencyKey("");

    } catch (err) {

      console.error(
        "Payment API error:",
        err
      );

      if (err.response) {

        const detail =
          err.response.data?.detail;

        if (Array.isArray(detail)) {

          setError(
            detail
              .map(
                (item) => item.msg
              )
              .join(", ")
          );

        } else {

          setError(
            detail ||
            "Payment request failed."
          );

        }

      } else {

        setError(
          "Unable to connect to payment server."
        );

      }

    } finally {

      setLoading(false);

    }
  };

  return (

    <div className="section">

      <h1>
        Make Payment
      </h1>

      <p className="welcome">
        Create a secure payment transaction.
      </p>

      <form
        className="payment-form"
        onSubmit={handlePayment}
      >

        {/* TRANSACTION ID */}

        <label>
          Transaction ID
        </label>

        <input
          type="text"
          placeholder="Enter transaction ID"
          value={transactionId}
          onChange={(e) =>
            setTransactionId(
              e.target.value
            )
          }
          required
        />

        {/* AMOUNT */}

        <label>
          Amount
        </label>

        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) =>
            setAmount(
              e.target.value
            )
          }
          min="1"
          step="0.01"
          required
        />

        {/* CURRENCY */}

        <label>
          Currency
        </label>

        <select
          value={currency}
          onChange={(e) =>
            setCurrency(
              e.target.value
            )
          }
        >

          <option value="INR">
            INR
          </option>

          <option value="USD">
            USD
          </option>

          <option value="EUR">
            EUR
          </option>

        </select>

        {/* IDEMPOTENCY KEY */}

        <label>
          Idempotency Key
        </label>

        <input
          type="text"
          placeholder="Enter unique idempotency key"
          value={idempotencyKey}
          onChange={(e) =>
            setIdempotencyKey(
              e.target.value
            )
          }
          minLength={8}
          maxLength={128}
          required
        />

        {/* API KEY */}

        <label>
          API Key
        </label>

        <input
          type="password"
          className="password-input"
          placeholder="Enter API key"
          value={apiKey}
          onChange={(e) =>
            setApiKey(
              e.target.value
            )
          }
          required
        />

        {/* BUTTON */}

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Processing..."
            : "Process Payment"}
        </button>

      </form>

      {/* SUCCESS */}

      {message && (
        <div className="payment-message success-message">
          ✓ {message}
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="payment-message error-message">
          ✕ {error}
        </div>
      )}

    </div>
  );
}

/* =====================================================
   TRANSACTIONS PAGE
===================================================== */

function TransactionsPage() {

  const [payments, setPayments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* FETCH TRANSACTIONS */

  const fetchPayments = async () => {

    try {

      setError("");

      const response =
        await api.get("/payments");

      setPayments(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (err) {

      console.error(
        "Transactions error:",
        err
      );

      setError(
        "Unable to load transactions."
      );

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {

    fetchPayments();

    const interval =
      setInterval(
        fetchPayments,
        5000
      );

    return () =>
      clearInterval(interval);

  }, []);

  return (

    <div className="section">

      <h1>
        Transactions
      </h1>

      <p className="welcome">
        View payment transactions.
      </p>

      {error && (
        <div className="payment-message error-message">
          ✕ {error}
        </div>
      )}

      {loading ? (

        <p>
          Loading transactions...
        </p>

      ) : payments.length === 0 ? (

        <p>
          No transactions found.
        </p>

      ) : (

        <table>

          <thead>

            <tr>
              <th>ID</th>
              <th>Transaction ID</th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Status</th>
            </tr>

          </thead>

          <tbody>

            {payments.map(
              (payment) => (

                <tr key={payment.id}>

                  <td>
                    {payment.id}
                  </td>

                  <td>
                    {payment.transaction_id}
                  </td>

                  <td>

                    {payment.currency === "INR"
                      ? "₹"
                      : ""}

                    {Number(
                      payment.amount || 0
                    ).toLocaleString(
                      "en-IN"
                    )}

                  </td>

                  <td>
                    {payment.currency}
                  </td>

                  <td>

                    <span className="status">
                      {payment.status}
                    </span>

                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      )}

    </div>
  );
}

/* =====================================================
   RECONCILIATION PAGE
===================================================== */

function ReconciliationPage() {

  return (

    <div className="section">

      <h1>
        Reconciliation
      </h1>

      <p className="welcome">
        Payment reconciliation status.
      </p>

      <div className="reconciliation">

        <h2>
          Airflow DAG
        </h2>

        <p>
          payment_reconciliation
        </p>

        <div className="success">
          ✓ 3 Successful Runs
        </div>

        <p>
          The reconciliation workflow
          is active and running successfully.
        </p>

      </div>

    </div>
  );
}

/* =====================================================
   EXPORT
===================================================== */

export default App;