import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthProvider";
import { PrivateRoute } from "./components/PrivateRoute/PrivateRoute";

import { Layout } from "./components/Layout/Layout";
import { PublicLayout } from "./components/PublicLayout/PublicLayout";

import { Home } from "./pages/Home/Home";
import { History } from "./pages/History/History";
import { About } from "./pages/About/About";

import { Login } from "./pages/Login/Login";
import { Register } from "./pages/Register/Register";

import { Background } from "./components/Background/Background";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Background />

        <Routes>

          {/* rotas públicas */}
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* rotas privadas */}
          <Route
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/history" element={<History />} />
            <Route path="/about" element={<About />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;