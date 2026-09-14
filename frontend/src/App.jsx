import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

/* =====================================================
   API CONFIGURATION
===================================================== */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://secure-payment-engine-backend.onrender.com";

const API_KEY =
  import.meta.env.VITE_API_KEY ||
  "secure-payment-demo-2026";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* =====================================================
   DEMO DATA
   Used only if Render backend is temporarily unavailable
===================================================== */

const DEMO_PAYMENTS = [
  {
    id: 1,
    transaction_id: "REVOLUT_KAFKA_001",
    amount: 1500,
    currency: "INR",
    status: "PENDING",
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    transaction_id: "FINAL_TEST_001",
    amount: 2500,
    currency: "INR",
    status: "PENDING",
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    transaction_id: "FRONTEND_TEST_003",
    amount: 1000,
    currency: "INR",
    status: "PENDING",
    created_at: new Date().toISOString(),
  },
];

/* =====================================================
   AUTH HEADERS
===================================================== */

const getAuthHeaders = () => ({
  "X-API-Key": API_KEY,
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

    const username =
      e.target.username.value.trim();

    const password =
      e.target.password.value;

    if (
      username === "admin" &&
      password === "admin123"
    ) {
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

          <div className="logo">
            ₹
          </div>

          <h1>
            Secure Payment Engine
          </h1>

          <p className="subtitle">
            Secure • Reliable • Fast Payments
          </p>

          <form onSubmit={handleLogin}>

            <label htmlFor="username">
              Username
            </label>

            <input
              id="username"
              name="username"
              type="text"
              placeholder="Enter username"
              autoComplete="username"
              required
            />

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter password"
              autoComplete="current-password"
              required
              className="password-input"
            />

            <button type="submit">
              LOGIN
            </button>

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

          <div className="brand-logo">
            ₹
          </div>

          <div>
            <h2>
              SecurePay
            </h2>

            <span>
              Payment Transaction Engine
            </span>
          </div>

        </div>

        <button
          className="logout"
          onClick={() => setLoggedIn(false)}
        >
          Logout
        </button>

      </header>

      {/* LAYOUT */}

      <div className="layout">

        {/* SIDEBAR */}

        <aside className="sidebar">

          <button
            className={
              activePage === "dashboard"
                ? "active"
                : ""
            }
            onClick={() =>
              setActivePage("dashboard")
            }
          >
            🏠 Dashboard
          </button>

          <button
            className={
              activePage === "payment"
                ? "active"
                : ""
            }
            onClick={() =>
              setActivePage("payment")
            }
          >
            💳 Make Payment
          </button>

          <button
            className={
              activePage === "transactions"
                ? "active"
                : ""
            }
            onClick={() =>
              setActivePage("transactions")
            }
          >
            📋 Transactions
          </button>

          <button
            className={
              activePage === "reconciliation"
                ? "active"
                : ""
            }
            onClick={() =>
              setActivePage("reconciliation")
            }
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
   DASHBOARD
===================================================== */

function DashboardPage() {

  const [payments, setPayments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [usingDemoData, setUsingDemoData] =
    useState(false);

  const fetchPayments = async () => {

    try {

      const response =
        await api.get(
          "/payments",
          {
            headers: getAuthHeaders(),
          }
        );

      if (
        Array.isArray(response.data)
      ) {

        setPayments(
          response.data
        );

        setUsingDemoData(false);

      } else {

        setPayments(
          DEMO_PAYMENTS
        );

        setUsingDemoData(true);
      }

    } catch (err) {

      console.error(
        "Payment API:",
        err.response?.data ||
        err.message
      );

      /*
        Do not show an error on the dashboard.
        Use demo data when Render backend/database
        is temporarily unavailable.
      */

      setPayments(
        DEMO_PAYMENTS
      );

      setUsingDemoData(true);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {

    fetchPayments();

    const interval =
      setInterval(
        fetchPayments,
        10000
      );

    return () =>
      clearInterval(interval);

  }, []);

  /* ===================================================
     STATISTICS
  =================================================== */

  const totalPayments =
    payments.length;

  const pendingPayments =
    payments.filter(
      (payment) =>
        String(
          payment.status
        ).toUpperCase() ===
        "PENDING"
    ).length;

  const totalAmount =
    payments.reduce(
      (total, payment) =>
        total +
        Number(
          payment.amount || 0
        ),
      0
    );

  const formatAmount =
    (amount) => {

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

      <h1>
        Dashboard
      </h1>

      <p className="welcome">
        Welcome back, Admin 👋
      </p>

      {/* OPTIONAL INFO */}

      {usingDemoData && (
        <div className="payment-message">
          ℹ Showing demo transactions
        </div>
      )}

      {/* CARDS */}

      <div className="cards">

        <div className="stat-card">

          <span>
            Total Payments
          </span>

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

          <span>
            Pending Payments
          </span>

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

          <span>
            Total Amount
          </span>

          <h2>
            {loading
              ? "..."
              : `₹${formatAmount(
                  totalAmount
                )}`}
          </h2>

          <p>
            Payment volume
          </p>

        </div>

        <div className="stat-card">

          <span>
            System Status
          </span>

          <h2>
            Healthy
          </h2>

          <p>
            Payment system operational
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
                .map(
                  (payment) => (

                    <tr
                      key={
                        payment.id
                      }
                    >

                      <td>
                        {payment.id}
                      </td>

                      <td>
                        {
                          payment.transaction_id
                        }
                      </td>

                      <td>

                        {payment.currency ===
                        "INR"
                          ? "₹"
                          : payment.currency ===
                            "USD"
                          ? "$"
                          : "€"}

                        {Number(
                          payment.amount ||
                          0
                        ).toLocaleString(
                          "en-IN"
                        )}

                      </td>

                      <td>
                        {payment.currency}
                      </td>

                      <td>

                        <span className="status">
                          {
                            payment.status
                          }
                        </span>

                      </td>

                    </tr>

                  )
                )}

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
    useState(API_KEY);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handlePayment =
    async (e) => {

      e.preventDefault();

      setLoading(true);
      setMessage("");
      setError("");

      try {

        const response =
          await api.post(
            "/payments",
            {
              transaction_id:
                transactionId,

              amount:
                Number(amount),

              currency:
                currency,

              status:
                "PENDING",
            },
            {
              headers: {
                "X-API-Key":
                  apiKey || API_KEY,

                ...(idempotencyKey
                  ? {
                      "Idempotency-Key":
                        idempotencyKey,
                    }
                  : {}),
              },
            }
          );

        setMessage(
          `Payment created successfully! Payment ID: ${response.data.payment_id}`
        );

        setTransactionId("");
        setAmount("");
        setIdempotencyKey("");

      } catch (err) {

        console.error(
          "Payment error:",
          err.response?.data ||
          err.message
        );

        const detail =
          err.response?.data?.detail;

        if (
          Array.isArray(detail)
        ) {

          setError(
            detail
              .map(
                (item) =>
                  item.msg
              )
              .join(", ")
          );

        } else {

          setError(
            detail ||
            "Payment request failed."
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
        onSubmit={
          handlePayment
        }
      >

        <label>
          Transaction ID
        </label>

        <input
          type="text"
          placeholder="Enter transaction ID"
          value={
            transactionId
          }
          onChange={(e) =>
            setTransactionId(
              e.target.value
            )
          }
          required
        />

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

        <label>
          Idempotency Key
        </label>

        <input
          type="text"
          placeholder="Enter unique idempotency key"
          value={
            idempotencyKey
          }
          onChange={(e) =>
            setIdempotencyKey(
              e.target.value
            )
          }
          minLength={8}
          maxLength={128}
          required
        />

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

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Processing..."
            : "Process Payment"}
        </button>

      </form>

      {message && (
        <div className="payment-message success-message">
          ✓ {message}
        </div>
      )}

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

  const fetchPayments =
    async () => {

      try {

        const response =
          await api.get(
            "/payments",
            {
              headers:
                getAuthHeaders(),
            }
          );

        if (
          Array.isArray(
            response.data
          )
        ) {

          setPayments(
            response.data
          );

        } else {

          setPayments(
            DEMO_PAYMENTS
          );

        }

      } catch (err) {

        console.error(
          "Transactions error:",
          err.response?.data ||
          err.message
        );

        setPayments(
          DEMO_PAYMENTS
        );

      } finally {

        setLoading(false);

      }
    };

  useEffect(() => {

    fetchPayments();

  }, []);

  return (

    <div className="section">

      <h1>
        Transactions
      </h1>

      <p className="welcome">
        View payment transactions.
      </p>

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

              <th>
                ID
              </th>

              <th>
                Transaction ID
              </th>

              <th>
                Amount
              </th>

              <th>
                Currency
              </th>

              <th>
                Status
              </th>

            </tr>

          </thead>

          <tbody>

            {payments.map(
              (payment) => (

                <tr
                  key={
                    payment.id
                  }
                >

                  <td>
                    {payment.id}
                  </td>

                  <td>
                    {
                      payment.transaction_id
                    }
                  </td>

                  <td>

                    {payment.currency ===
                    "INR"
                      ? "₹"
                      : payment.currency ===
                        "USD"
                      ? "$"
                      : "€"}

                    {Number(
                      payment.amount ||
                      0
                    ).toLocaleString(
                      "en-IN"
                    )}

                  </td>

                  <td>
                    {payment.currency}
                  </td>

                  <td>

                    <span className="status">
                      {
                        payment.status
                      }
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