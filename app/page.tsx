import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import GradingSystem from "@/components/GradingSystem";
import Benefits from "@/components/Benefits";
import SignupSection from "@/components/SignupSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <GradingSystem />
        <Benefits />
        <SignupSection />
      </main>
      <Footer />
    </>
  );
}
