import NavBar from "@/components/NavBar/NavBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex">
        <NavBar />
        <main className="ml-20 w-full p-6 ">
          {children}
        </main>
      </div>
    </>
  );
}
