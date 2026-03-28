import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createCampaign, fetchCampaigns, updateCampaignStatus } from "../redux/campaignSlice";
import { RootState, AppDispatch } from "../redux/store";
import {
  Form,
  Button,
  Container,
  Toast,
  ToastContainer,
  Card,
  Row,
  Col,
  Modal,
  Dropdown,
  Spinner,
  Alert,
} from "react-bootstrap";
import "../styles/CampaignPage.css"; 

const CampaignPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { campaigns, loading, error } = useSelector((state: RootState) => state.campaign);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fundingGoal, setFundingGoal] = useState("");
  const [equityOffered, setEquityOffered] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<null | any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    dispatch(fetchCampaigns());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fundingGoalValue = parseInt(fundingGoal, 10);
    const equityOfferedValue = parseFloat(equityOffered);

    if (isNaN(fundingGoalValue) || fundingGoalValue <= 0) {
      alert("Funding goal must be a positive integer in USD.");
      return;
    }
    if (isNaN(equityOfferedValue) || equityOfferedValue < 0 || equityOfferedValue > 100) {
      alert("Equity offered must be between 0 and 100%.");
      return;
    }

    await dispatch(createCampaign({ title, description, fundingGoal: fundingGoalValue, equityOffered: equityOfferedValue }));
    setShowToast(true);
    setTitle("");
    setDescription("");
    setFundingGoal("");
    setEquityOffered("");
    setShowCreateModal(false);
    dispatch(fetchCampaigns());
  };

  const handleShowDetails = (campaign: any) => {
    setSelectedCampaign(campaign);
    setShowModal(true);
  };

  const handleStatusChange = (campaignId: number, newStatus: string) => {
    dispatch(updateCampaignStatus({ campaignId: Number(campaignId), status: newStatus }));
    setShowModal(false);
  };

  return (
    <Container className="campaign-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="campaign-header">📢 Crowdfunding Campaigns</h2>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>➕ Create Campaign</Button>
      </div>

      {loading && <Spinner animation="border" className="d-block mx-auto" />}
      {error && <Alert variant="danger" className="text-center">{error}</Alert>}

      <Row>
        {(campaigns ?? []).map((campaign) => (
          <Col md={4} key={campaign.id} className="mb-4">
            <Card className="campaign-card shadow-sm">
              <Card.Body>
                <Card.Title className="text-primary">{campaign.title}</Card.Title>
                <Card.Text>
                  {campaign.description?.length > 100
                    ? `${campaign.description.substring(0, 100)}...`
                    : campaign.description}
                </Card.Text>
                <Card.Text>
  🎯 <strong>Funding Goal:</strong> 
  <span className="text-success">
    {campaign.fundingGoal ? `$${campaign.fundingGoal.toLocaleString()}` : "N/A"}
  </span>
</Card.Text>
                <Card.Text>
                  📊 <strong>Equity Offered:</strong> <span className="text-info">{campaign.equityOffered}%</span>
                </Card.Text>
                <Card.Text>
                  🔍 <strong>Status:</strong> <span className="badge bg-secondary">{campaign.status || "Active"}</span>
                </Card.Text>
                <Button variant="info" className="mt-2 w-100" onClick={() => handleShowDetails(campaign)}>
                  View Details
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedCampaign?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>Description:</strong> {selectedCampaign?.description}</p>
          <p><strong>Funding Goal:</strong> ${selectedCampaign?.fundingGoal.toLocaleString()}</p>
          <p><strong>Equity Offered:</strong> {selectedCampaign?.equityOffered}%</p>
          <p><strong>Status:</strong> <span className="badge bg-info">{selectedCampaign?.status || "Active"}</span></p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create a Campaign</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" value={description} onChange={(e) => setDescription(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Funding Goal (USD)</Form.Label>
              <Form.Control type="number" value={fundingGoal} onChange={(e) => setFundingGoal(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Equity Offered (%)</Form.Label>
              <Form.Control type="number" value={equityOffered} onChange={(e) => setEquityOffered(e.target.value)} required />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">Create Campaign</Button>
          </Form>
        </Modal.Body>
      </Modal>

      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide>
          <Toast.Body>✅ Campaign created successfully!</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default CampaignPage;
