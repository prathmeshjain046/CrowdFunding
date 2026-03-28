import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyCampaigns, updateCampaignStatus } from "../redux/campaignSlice";
import { RootState, AppDispatch } from "../redux/store";
import {
  Container,
  Card,
  Row,
  Col,
  Modal,
  Dropdown,
  Spinner,
  Alert,
  Button,
} from "react-bootstrap";
import "../styles/CampaignPage.css";

const MyCampaigns: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { myCampaigns, loading, error } = useSelector(
    (state: RootState) => state.campaign
  );
  const [selectedCampaign, setSelectedCampaign] = useState<null | any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchMyCampaigns());
  }, [dispatch]);

  const handleShowDetails = (campaign: any) => {
    setSelectedCampaign(campaign);
    setShowModal(true);
  };

  const handleStatusChange = (campaignId: number, newStatus: string) => {
    dispatch(updateCampaignStatus({ campaignId, status: newStatus }));
    setShowModal(false);
  };

  return (
    <Container className="campaign-container">
      <h2 className="campaign-header">📢 My Campaigns</h2>

      {loading && <Spinner animation="border" className="d-block mx-auto" />}
      {error && <Alert variant="danger" className="text-center">{error}</Alert>}
      {!loading && myCampaigns.length === 0 && (
        <Alert variant="info" className="text-center">
          You have not created any campaigns yet.
        </Alert>
      )}

      <Row>
        {myCampaigns.map((campaign) => (
          <Col md={4} key={campaign.id} className="mb-4">
            <Card className="campaign-card shadow-sm">
              <Card.Body>
                <Card.Title className="text-primary">{campaign.title}</Card.Title>
                <Card.Text>
                  {campaign.description.length > 100
                    ? `${campaign.description.substring(0, 100)}...`
                    : campaign.description}
                </Card.Text>
                <Card.Text>
                  🎯 <strong>Funding Goal:</strong>
                  <span className="text-success"> ${campaign.fundingGoal.toLocaleString()}</span>
                </Card.Text>
                <Card.Text>
                  📊 <strong>Equity Offered:</strong> <span className="text-info">{campaign.equityOffered}%</span>
                </Card.Text>
                <Card.Text>
                  🔍 <strong>Status:</strong> <span className="badge bg-secondary">{campaign.status}</span>
                </Card.Text>
                <Button
                  variant="info"
                  className="mt-2 w-100"
                  onClick={() => handleShowDetails(campaign)}
                >
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
          <p><strong>Funding Goal:</strong> ${selectedCampaign?.fundingGoal?.toLocaleString()}</p>
          <p><strong>Equity Offered:</strong> {selectedCampaign?.equityOffered}%</p>
          <p><strong>Status:</strong> <span className="badge bg-info">{selectedCampaign?.status}</span></p>
          <Dropdown onSelect={(newStatus) => handleStatusChange(selectedCampaign?.id, newStatus || "Active")}>
            <Dropdown.Toggle variant="secondary">Change Status</Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item eventKey="Active">Active</Dropdown.Item>
              <Dropdown.Item eventKey="Funded">Funded</Dropdown.Item>
              <Dropdown.Item eventKey="Closed">Closed</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MyCampaigns;