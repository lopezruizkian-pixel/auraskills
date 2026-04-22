import { useState } from "react";
import Sidebar from "../components/Sidebar";
import HomeMentor from "../components/HomeMentor";
import HomeAprendiz from "../components/HomeAprendiz";
import Notificaciones from "../components/Notificaciones";
import "../Styles/Home.css";

import { storage } from "../services/storage";

function Home() {
  const [rol] = useState(storage.get("userRole") || "alumno");
  return (
    <div className="home-container">
      <div className="home-main-layout">
        <Sidebar rol={rol} />
        <main className="home-content">
          {rol === "mentor" ? <HomeMentor /> : <HomeAprendiz />}
        </main>
      </div>
    </div>
  );
}

export default Home;
