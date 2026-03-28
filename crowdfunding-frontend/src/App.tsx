import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import CampaignPage from "./pages/Campaign";
import InvestmentPage from "./pages/Investment"; 
import NavbarComponent from "./components/NavbarComponent";
import CheckoutPage from "./pages/Checkout";
import Reports from "./pages/Report";
import PaymentsReport from "./pages/PaymentsReport";
import SharesReport from "./pages/SharesReport";
import MyCampaigns from "./pages/MyCampaign";
import Profile from "./pages/Profile";
import SharesReportById from "./pages/SharesReportById";
import MyInvestments from "./pages/MyInvestments";
import PrivateRoute from "./components/PrivateRoute";



const App: React.FC = () => {
  return (
    <Router>
      <NavbarComponent />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Home />} />
        <Route path="/campaign" element={<CampaignPage />} />
        <Route path="/investments" element={<PrivateRoute><InvestmentPage /></PrivateRoute>} />
        <Route path="/investments/my" element={<PrivateRoute><MyInvestments /></PrivateRoute>} />
        <Route path="/checkout/:investmentId/:amount" element={<CheckoutPage />} />
        <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
        <Route path="/reports/payments" element={<PaymentsReport />} />
        <Route path="/reports/shares" element={<SharesReport />} />
        <Route path="/reports/shares/:campaignId" element={<SharesReportById />} />
        <Route path="/campaign/my" element={<MyCampaigns />} /> 
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      </Routes>
    </Router>
  );
};

export default App;
