import "../styles/Home.module.css";
import { Header } from "../components/Header";
import { FundMe } from "../components/FundMe";

export default function Home() {
  return (
    <div className="box">
      <nav className="p-3 flex flex-row">
        <h1 className="py-2 text-white px-4 font-bold text-3xl">
          Decentralized Fund Transfer
        </h1>
        <div className="ml-auto py-2 px-4">
          <Header />
        </div>
      </nav>
      <div className="flex justify-center items-center">
        <FundMe />
      </div>
    </div>
  );
}
