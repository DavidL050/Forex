import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="container py-4">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
