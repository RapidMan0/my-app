import Header from "./components/Header";
import Home from "./components/Home";
import ContactInfo from "./components/ContactInfo";
import About from "./components/About";
import Services from "./components/Services";
import "./globals.css";
import PricingTabs from "./components/PricingTabs";
import BookingSystem from "./components/BookingSystem";
import GalleryWithFilters from "./components/GalleryWithFilters";

export default function Page() {
  return (
    <>
      <Header />
      <Home />
      <ContactInfo />
      <About />
      <GalleryWithFilters />
      <Services />
      <PricingTabs />
      <BookingSystem />
    </>
  );
}