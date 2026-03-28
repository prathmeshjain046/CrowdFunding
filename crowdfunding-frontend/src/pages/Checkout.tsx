

import React, { useState, useEffect } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Container, Card, Button, Spinner, Alert } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../utils/axios";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";


const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { investmentId, amount } = useParams<{ investmentId: string; amount: string }>();
  const token = useSelector((state: RootState) => state.auth.token);
  
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"Pending" | "Success" | "Failed" | null>(null);

  useEffect(() => {
    if (paymentStatus === "Success") {
      setTimeout(() => navigate("/investments/my"), 2000);
    }
  }, [paymentStatus, navigate]);

  const updatePaymentStatus = async (status: "Success" | "Failed") => {
    try {
      const response = await axios.post(
        `/investments/confirm-payment/${investmentId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        console.log("✅ Payment updated in backend:", status);
        setPaymentStatus(status);
      } else {
        console.log("⚠️ Backend returned non-200 status:", response.status);
        setPaymentStatus("Failed");
      }
    } catch (error) {
      console.error("❌ Error updating payment status:", error);
      setPaymentStatus("Failed");
    }
  };

  return (
    <PayPalScriptProvider options={{ clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID!, currency: "USD" }}>
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <Card style={{ width: "400px", padding: "20px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", borderRadius: "10px" }}>
          <Card.Body>
            <h2 className="text-center mb-4">Checkout</h2>

            {paymentStatus && (
              <Alert variant={paymentStatus === "Success" ? "success" : paymentStatus === "Failed" ? "danger" : "warning"} className="text-center">
                {paymentStatus === "Pending" && "⏳ Payment Pending..."}
                {paymentStatus === "Success" && "✅ Payment Successful! Redirecting..."}
                {paymentStatus === "Failed" && "❌ Payment Failed. Try Again."}
              </Alert>
            )}

            {paymentStatus === "Success" ? (
              <div className="text-center">
                <h4 className="text-success">Payment Successful! 🎉</h4>
                <Button variant="success" className="mt-3" onClick={() => navigate("/investments/my")}>Go to My Investments</Button>
              </div>
            ) : (
              <>
                {loading && (
                  <div className="text-center mb-3">
                    <Spinner animation="border" />
                    <p>Processing Payment...</p>
                  </div>
                )}

                <PayPalButtons
                  createOrder={(data, actions) => {
                    setLoading(true);
                    setPaymentStatus("Pending");
                    return actions.order.create({
                      intent: "CAPTURE",
                      purchase_units: [{ amount: { currency_code: "USD", value: amount || "10.00" } }],
                    });
                  }}
                  onApprove={(data, actions) => {
                    return actions.order!.capture().then(async (details) => {
                      setLoading(false);
                      alert(`✅ Payment Successful! Transaction ID: ${details.id}`);

                      // Update status only after API response
                      const response = await axios.post(
                        `/investments/confirm-payment/${investmentId}`,
                        {},
                        { headers: { Authorization: `Bearer ${token}` } }
                      );

                      if (response.status === 200) {
                        setPaymentStatus("Success");
                      } else {
                        setPaymentStatus("Failed");
                      }
                    }).catch((error) => {
                      console.error("❌ Error capturing payment:", error);
                      setPaymentStatus("Failed");
                    });
                  }}
                  onError={(err) => {
                    setLoading(false);
                    console.error("❌ Payment Error:", err);
                    setPaymentStatus("Failed");
                  }}
                />
              </>
            )}
          </Card.Body>
        </Card>
      </Container>
    </PayPalScriptProvider>
  );
};

export default Checkout;
