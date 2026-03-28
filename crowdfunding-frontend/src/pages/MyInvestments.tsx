import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";
import { Container, Card, Button } from "react-bootstrap";
import "../styles/MyInvestmentPage.css";

const MyInvestments: React.FC = () => {
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.auth.token);
  const [investments, setInvestments] = useState<any[]>([]);
  const [investmentError, setInvestmentError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyInvestments();
  }, []);

  const fetchMyInvestments = async () => {
    if (!token) {
      setInvestmentError("User is not authenticated");
      return;
    }
    try {
      const response = await axios.get("/investments/my-investments");

      // Sort investments: Pending first, then others
      const sortedInvestments = response.data.sort((a: any, b: any) =>
        a.status === "Pending" ? -1 : b.status === "Pending" ? 1 : 0
      );

      setInvestments(sortedInvestments);
    } catch {
      setInvestmentError("Failed to fetch investments. Please try again.");
    }
  };

  return (
    <>
      <h3 className="investment-heading">My Investments</h3>
      <Container className="investment-container">
        {investmentError && <p className="text-danger">Error: {investmentError}</p>}
        {investments.length === 0 ? (
          <p>No investments yet.</p>
        ) : (
          investments.map((inv) => (
            <Card key={inv.id} className="investment-card boxy-card mb-3">
              <Card.Body>
                <Card.Title>Campaign #{inv.campaignId}</Card.Title>
                <Card.Text>Amount: <strong>${inv.amount}</strong></Card.Text>
                <Card.Text>Status: <strong>{inv.status}</strong></Card.Text>
                {inv.status === "Pending" && (
                  <Button 
                    className="pay-now-button" 
                    onClick={() => navigate(`/checkout/${inv.id}/${inv.amount}`)}
                  >
                    Pay Now
                  </Button>
                )}
              </Card.Body>
            </Card>
          ))
        )}
      </Container>
    </>
  );
};

export default MyInvestments;
