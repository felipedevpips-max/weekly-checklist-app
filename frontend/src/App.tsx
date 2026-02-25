import styles from "./App.module.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Header } from "./components/Header/Header";

import { Home } from "./pages/Home/Home";

import { History } from "./pages/History/History";

import { About } from "./pages/About/About";

function App() {
  return (
    <BrowserRouter>
      <div className={styles.container}>
        <Header />

        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/history" element={<History />} />

          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
