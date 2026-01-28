import Header from "../components/Header";
import BookingHistory from "../components/BookingHistory";
import Footer from "../components/Footer";

export const metadata = {
  title: "История бронирований - SharpMen",
};

export default function BookingHistoryPage() {
  return (
    <>
      <Header />
      <BookingHistory />
      <Footer />
    </>
  );
}
