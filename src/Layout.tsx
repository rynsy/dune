import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }: LayoutProps) => {
  return (
    <div>
      <h1>Sand and Fluid Simulation</h1>
      {children}
    </div>
  );
};

export default Layout;
