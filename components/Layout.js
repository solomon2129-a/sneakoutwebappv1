import BottomNav from './BottomNav';

export default function Layout({ children, noNav = false }) {
  return (
    <div className="min-h-[100dvh] bg-[#09090B]">
      <div className="max-w-lg mx-auto relative min-h-[100dvh] overflow-x-hidden">
        <main className="anim-page">{children}</main>
        {!noNav && <BottomNav />}
      </div>
    </div>
  );
}
