import Banner from "@/components/Banner/Banner";
import Services from "@/components/Services/Services";
import Form from "@/components/Form/Form";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <Banner />
      <Services />
      <Form />
    </>
  );
}
