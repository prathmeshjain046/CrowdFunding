import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import { fetchCampaigns } from "../redux/campaignSlice";
import axios from "../utils/axios";
import { Container, Card, Button, Modal, Form, Row, Col, Badge } from "react-bootstrap";
import "../styles/InvestmentPage.css";

const InvestmentPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { campaigns, loading, error } = useSelector((state: RootState) => state.campaign);
  const token = useSelector((state: RootState) => state.auth.token);
  const [showModal, setShowModal] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState<string>("1");
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [investmentError, setInvestmentError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCampaigns());
  }, [dispatch]);

  const handleInvest = async () => {
    if (!selectedCampaign || Number(investmentAmount) < 1 || !token) return;

    try {
      await axios.post("/investments/invest", {
        campaignId: selectedCampaign.id,
        amount: Number(investmentAmount),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowModal(false);
      setInvestmentAmount("1");
    } catch {
      setInvestmentError("Investment failed. Please try again.");
    }
  };

  return (
    <Container className="investment-container">
      <h2 className="text-center investment-heading">Invest in Campaigns</h2>
      {loading && <p className="loading-text">Loading campaigns...</p>}
      {error && <p className="text-danger">Error: {error}</p>}
      {investmentError && <p className="text-danger">Error: {investmentError}</p>}

      <Row>
        {campaigns.map((campaign) => {
          const remainingAmount = Math.max(0, campaign.fundingGoal - campaign.amountRaised);
          return (
            <Col md={4} key={campaign.id} className="mb-4">
              <Card className="campaign-card shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <Card.Title>{campaign.title}</Card.Title>
                    <Badge className="campaign-badge" bg={
                      remainingAmount === 0 ? "warning" : campaign.status === "Active" ? "success" : "danger"
                    }>{campaign.status}</Badge>
                  </div>
                  <Card.Text className="campaign-text">{campaign.description.substring(0, 80)}...</Card.Text>
                  <Card.Text><strong>Date Created:</strong> {new Date(campaign.createdAt).toLocaleDateString()}</Card.Text>
                  <Card.Text><strong>Funding Goal:</strong> ${campaign.fundingGoal}</Card.Text>
                  <Card.Text><strong>Amount Raised:</strong> ${campaign.amountRaised}</Card.Text>
                  <Card.Text><strong>Remaining Amount:</strong> ${remainingAmount}</Card.Text>
                  <Card.Text><strong>Equity Offered:</strong> {campaign.equityOffered}%</Card.Text>

                  {expandedCard === campaign.id && (
                    <Card.Text><strong>Details:</strong> {campaign.description}</Card.Text>
                  )}

                  <Button variant="outline-primary" className="me-2" onClick={() => setExpandedCard(expandedCard === campaign.id ? null : campaign.id)}>
                    {expandedCard === campaign.id ? "Show Less" : "Show More"}
                  </Button>
                  {campaign.status === "Active" && remainingAmount > 0 && (
                    <Button className="invest-button" onClick={() => {
                      setSelectedCampaign(campaign);
                      setInvestmentAmount("1");
                      setShowModal(true);
                    }}>Invest</Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Invest in {selectedCampaign?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Investment Amount</Form.Label>
              <Form.Control
                type="number"
                value={investmentAmount}
                min={1}
                max={selectedCampaign ? selectedCampaign.fundingGoal - selectedCampaign.amountRaised : 1}
                onChange={(e) => {
                  const value = Math.min(Number(e.target.value), selectedCampaign.fundingGoal - selectedCampaign.amountRaised);
                  setInvestmentAmount(value.toString());
                }}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="confirm-invest-button"
            onClick={handleInvest}
            disabled={Number(investmentAmount) < 1}
          >
            Confirm Investment
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default InvestmentPage;
