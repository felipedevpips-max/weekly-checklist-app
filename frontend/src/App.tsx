import styles from "./App.module.css";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { Header } from "./components/Header/Header";
import { Footer } from "./components/Footer/Footer";

import { Home } from "./pages/Home/Home";
import { History } from "./pages/History/History";
import { About } from "./pages/About/About";

import { Login } from "./pages/Login/Login";
import { Register } from "./pages/Register/Register";

import { AuthProvider } from "./context/AuthProvider";
import { PrivateRoute } from "./components/PrivateRoute/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rotas privadas */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <>
                  <Header />
                  <div className={styles.container}>
                    <Home />
                  </div>
                  <Footer />
                </>
              </PrivateRoute>
            }
          />

          <Route
            path="/history"
            element={
              <PrivateRoute>
                <>
                  <Header />
                  <div className={styles.container}>
                    <History />
                  </div>
                  <Footer />
                </>
              </PrivateRoute>
            }
          />

          <Route
            path="/about"
            element={
              <PrivateRoute>
                <>
                  <Header />
                  <div className={styles.container}>
                    <About />
                  </div>
                  <Footer />
                </>
              </PrivateRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
