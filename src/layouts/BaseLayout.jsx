import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/custom.css';

const BaseLayout = ({ 
  navbar: Navbar,
  sidebar: Sidebar,
  sidebarCollapsed = false
}) => {
  const { user, clinic } = useAuth();
  const sidebarWidth = sidebarCollapsed ? '4rem' : '16rem';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50">
        {Navbar && <Navbar user={user} clinic={clinic} />}
      </header>

      <div className="flex pt-[60px]"> {/* Add padding-top to account for fixed header */}
        {/* Fixed Sidebar */}
        {Sidebar && (
          <aside 
            className="fixed left-0 top-[60px] h-[calc(100vh-60px)] overflow-hidden transition-all duration-300 z-40"
            style={{ width: sidebarWidth }}
          >
            <Sidebar user={user} clinic={clinic} />
          </aside>
        )}

        {/* Main Content - Add margin for sidebar and scrolling */}
        <main 
          className="flex-1 p-6 min-h-[calc(100vh-60px)] transition-all duration-300 scrollbar-styled main-container"
          style={{ marginLeft: sidebarWidth }}
        >
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default BaseLayout;