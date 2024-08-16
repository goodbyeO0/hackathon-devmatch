import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Contoh from "./Pages/Contoh";
import Navbar from "./components/Navbar";
import AddItem from "./Pages/AddItem";
import ViewItems from "./Pages/ViewItems";

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
          </Routes>
        </Router>
      </div>
    </>
  );
}

export default App;
