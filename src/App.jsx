import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Contoh from "./Pages/Contoh";
import Navbar from "./components/Navbar";
import AddItem from "./Pages/AddItem";
import ViewItems from "./Pages/ViewItems";
import RequestApi from "./Pages/RequestApi";
import RealTimeProductScanner from "./Pages/AssociateItem";
import PurchaseItems from "./Pages/PurchaseItems";
import WithdrawFunds from "./Pages/Withdraw";
import MintReceipt from "./Pages/MintReceipt";
import ThankYou from "./Pages/Thankyou";

function App() {
  return (
    <>
      <div className=" flex flex-col">
        <Navbar />
        <Router>
          <Routes>
            <Route path="/" element={<Contoh />} />
            <Route path="/add-item" element={<AddItem />} />
            <Route path="/view-items" element={<ViewItems />} />
            <Route path="/request-api" element={<RequestApi />} />
            <Route path="/purchase-items" element={<PurchaseItems />} />
            <Route path="/withdraw" element={<WithdrawFunds />} />
            <Route path="/mint-receipt" element={<MintReceipt />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route
              path="/associate-item"
              element={<RealTimeProductScanner />}
            />
          </Routes>
        </Router>
      </div>
    </>
  );
}

export default App;
