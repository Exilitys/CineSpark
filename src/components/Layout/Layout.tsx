import React from "react";
import { Header } from "./Header";
import { ProjectIndicator } from "./ProjectIndicator";
import { ToastContainer } from "react-toastify";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <ToastContainer />
      <Header />
      <ProjectIndicator />
      <div className="flex">
        <main className="flex-1 min-h-screen">{children}</main>
      </div>
    </div>
  );
};
