import Header from "../components/Header";
import AdminDashboard from "../components/AdminDashboard";
import Footer from "../components/Footer";

export const metadata = {
  title: "Админ панель - SharpMen",
};

export default function AdminPage() {
  return (
    <>
      <Header />
      <AdminDashboard />
      <Footer />
    </>
  );
}
