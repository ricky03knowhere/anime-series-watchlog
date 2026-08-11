import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { useSidebar } from '@/contexts/SidebarContext';

function MainLayout() {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-svh" style={{ background: 'var(--bg)' }}>
      <Sidebar />

      {/* ─── Main Content Area ─── */}
      <div
        className="transition-all duration-300"
        style={{
          marginLeft: 'var(--sidebar-width)',
        }}
      >
        <style>{`
          :root {
            --sidebar-width: 0px;
          }
          @media (min-width: 1024px) {
            :root {
              --sidebar-width: ${isCollapsed ? '72px' : '256px'};
            }
          }
        `}</style>

        <Navbar />

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
