import Header from "./components/Header";
import Home from "./components/Home";
import ContactInfo from "./components/ContactInfo";
import About from "./components/About";
import Services from "./components/Services";
import "./globals.css";

export default function Page() {
  return (
    <>
      <Header />
      <Home />
      <ContactInfo />
      <About />
      <Services />
    </>
  );
}
