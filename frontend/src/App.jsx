import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

/*
=====================================================
API CONFIGURATION
=====================================================

LOCAL:
VITE_API_URL=http://localhost:8000

RENDER:
Set VITE_API_URL to your deployed FastAPI backend URL.

If the frontend and backend are served from the same
domain, you can leave this as an empty string.
*/

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


/* =====================================================
   MAIN APP
===================================================== */

function App() {

  const [loggedIn, setLoggedIn] = useState(false);

  const [activePage, setActivePage] =
    useState("dashboard");


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

      alert(
        "Invalid username or password"
      );

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
              style={{
                color: "#111827",
                backgroundColor: "#ffffff",
                WebkitTextFillColor: "#111827",
                opacity: 1,
              }}
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

      {/* =================================================
         NAVBAR
      ================================================= */}

      <header className="navbar">

        <div className="brand">

          <div className="brand-logo">
            ₹