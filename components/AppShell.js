export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <div className="mx-auto min-h-screen max-w-[420px] bg-white shadow-lg">{children}</div>
    </div>
  );
}
