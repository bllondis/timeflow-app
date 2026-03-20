import Topbar from './Topbar';
import SidebarNav from './SidebarNav';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <Topbar />
      <SidebarNav />
      <main className="ml-[240px] mt-14 bg-background min-h-[calc(100vh-56px)]">
        <div className="max-w-[1120px] mx-auto px-10 py-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
