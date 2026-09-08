import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:8000";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");

  // Store API key for the current session
  const [apiKey, setApiKey] = useState(
    localStorage.getItem("payment_api_key") || ""
  );

  // Payment data from backend
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  // ============================================================
  // FETCH PAYMENTS FROM FASTAPI
  // ============================================================

  const fetchPayments = async () => {
    if (!apiKey) {
      return;
    }

    try {
      setLoadingPayments(true);
      setPaymentError("");

      const response = await axios.get(
        `${API_URL}/payments`,
        {
          headers: {
            "X-API-Key": apiKey,
          },
        }
      );

      setPayments(response.data);
    } catch (error) {
      console.error("Failed to fetch payments:", error);

      if (error.response) {
        setPaymentError(
          error.response.data?.detail ||
            "Unable to load payments"
        );
      } else {
        setPaymentError(
          "Unable to connect to payment server."
        );
      }
    } finally {
      setLoadingPayments(false);
    }
  };

  // ============================================================
  // FETCH PAYMENTS WHEN DASHBOARD OPENS
  // ============================================================

  useEffect(() => {
    if (loggedIn && apiKey) {
      fetchPayments();
    }
  }, [loggedIn, apiKey]);

  // ============================================================
  // LOGIN
  // ============================================================

  const handleLogin = (e) => {
    e.preventDefault();

    const username = e.target.username.value;
    const password = e.target.password.value;

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

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    setLoggedIn(false);
    setPayments([]);
  };

  // ============================================================
  // LOGIN SCREEN
  // ============================================================

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

            <label>Username</label>

            <input
              name="username"
              type="text"
              placeholder="Enter username"
              required
            />

            <label>Password</label>

            <input
              name="password"
              type="password"
              placeholder="Enter password"
              required
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

  // ============================================================
  // DASHBOARD CALCULATIONS
  // ============================================================

  const totalPayments = payments.length;

  const pendingPayments = payments.filter(
    (payment) =>
      payment.status === "PENDING"
  ).length;

  const totalAmount = payments.reduce(
    (sum, payment) =>
      sum + Number(payment.amount || 0),
    0
  );

  // ============================================================
  // MAIN APPLICATION
  // ============================================================

  return (
    <div className="app">

      {/* NAVBAR */}

      <header className="navbar">

        <div className="brand">

          <div className="brand-logo">
            ₹
          </div>

          <div>
            <h2>SecurePay</h2>

            <span>
              Payment Transaction Engine
            </span>
          </div>

        </div>

        <button
          className="logout"
          onClick={handleLogout}
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

          {/* ====================================================
              DASHBOARD
          ==================================================== */}

          {activePage === "dashboard" && (
            <>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >

                <div>
                  <h1>Dashboard</h1>

                  <p className="welcome">
                    Welcome back, Admin 👋
                  </p>
                </div>

                <button
                  onClick={fetchPayments}
                  disabled={loadingPayments}
                >
                  {loadingPayments
                    ? "Refreshing..."
                    : "↻ Refresh"}
                </button>

              </div>

              {/* ERROR */}

              {paymentError && (
                <div className="payment-message error-message">
                  ✕ {paymentError}
                </div>
              )}

              {/* STAT CARDS */}

              <div className="cards">

                <div className="stat-card">

                  <span>
                    Total Payments
                  </span>

                  <h2>
                    {totalPayments}
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
                    {pendingPayments}
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
                    ₹
                    {totalAmount.toLocaleString(
                      "en-IN",
                      {
                        maximumFractionDigits: 2,
                      }
                    )}
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
                    All services operational
                  </p>

                </div>

              </div>

              {/* RECENT TRANSACTIONS */}

              <div className="section">

                <h2>
                  Recent Transactions
                </h2>

                {loadingPayments ? (
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
                        <th>Transaction</th>
                        <th>Amount</th>
                        <th>Currency</th>
                        <th>Status</th>
                      </tr>

                    </thead>

                    <tbody>

                      {payments
                        .slice(0, 5)
                        .map((payment) => (

                          <tr key={payment.id}>

                            <td>
                              {payment.id}
                            </td>

                            <td>
                              {payment.transaction_id}
                            </td>

                            <td>
                              ₹
                              {Number(
                                payment.amount
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

                        ))}

                    </tbody>

                  </table>

                )}

              </div>

            </>
          )}

          {/* ====================================================
              MAKE PAYMENT
          ==================================================== */}

          {activePage === "payment" && (
            <PaymentPage
              apiKey={apiKey}
              setApiKey={setApiKey}
              onPaymentCreated={fetchPayments}
            />
          )}

          {/* ====================================================
              TRANSACTIONS
          ==================================================== */}

          {activePage === "transactions" && (
            <div className="section">

              <h1>
                Transactions
              </h1>

              <p className="welcome">
                View payment transactions.
              </p>

              {payments.length === 0 ? (

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

                    {payments.map((payment) => (

                      <tr key={payment.id}>

                        <td>
                          {payment.id}
                        </td>

                        <td>
                          {payment.transaction_id}
                        </td>

                        <td>
                          ₹
                          {Number(
                            payment.amount
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

                    ))}

                  </tbody>

                </table>

              )}

            </div>
          )}

          {/* ====================================================
              RECONCILIATION
          ==================================================== */}

          {activePage === "reconciliation" && (
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
          )}

        </main>

      </div>

    </div>
  );
}


/* ============================================================
   PAYMENT PAGE
============================================================ */

function PaymentPage({
  apiKey,
  setApiKey,
  onPaymentCreated,
}) {

  const [transactionId, setTransactionId] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [currency, setCurrency] =
    useState("INR");

  const [idempotencyKey, setIdempotencyKey] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  // ============================================================
  // PAYMENT REQUEST
  // ============================================================

  const handlePayment = async (e) => {

    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {

      const response = await axios.post(

        `${API_URL}/payments`,

        {
          transaction_id:
            transactionId,

          amount:
            Number(amount),

          currency:
            currency,

          idempotency_key:
            idempotencyKey,
        },

        {
          headers: {

            "Content-Type":
              "application/json",

            "Idempotency-Key":
              idempotencyKey,

            "X-API-Key":
              apiKey,
          },
        }

      );

      // Save API key for Dashboard requests
      localStorage.setItem(
        "payment_api_key",
        apiKey
      );

      setMessage(
        `Payment created successfully! Payment ID: ${response.data.payment_id}`
      );

      setTransactionId("");
      setAmount("");
      setIdempotencyKey("");

      // Refresh dashboard data
      if (onPaymentCreated) {
        await onPaymentCreated();
      }

    } catch (error) {

      if (error.response) {

        const detail =
          error.response.data?.detail;

        if (Array.isArray(detail)) {

          setError(
            detail
              .map((item) => item.msg)
              .join(", ")
          );

        } else {

          setError(
            detail ||
              "Payment request failed"
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


  // ============================================================
  // PAYMENT FORM
  // ============================================================

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
          value={idempotencyKey}
          onChange={(e) =>
            setIdempotencyKey(
              e.target.value
            )
          }
          required
        />


        <label>
          API Key
        </label>

        <input
          type="password"
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


export default App;