export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-base dark:bg-[#0a0a0a]">
      {children}
    </div>
  );
}
