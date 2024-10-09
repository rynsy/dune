import React from "react";
import { createRoot } from "react-dom/client";
import Layout from "./Layout";
import Simulation from "./components/Simulation";

const App: React.FC = () => {
  return (
    <Layout>
      <Simulation />
    </Layout>
  );
};

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error("Root element not found");
}
