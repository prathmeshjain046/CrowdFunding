import React, { useEffect, useState } from "react";
import { Container, Card, Spinner, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "../../src/utils/axios";
import "../styles/SharesReport.css"; 

interface Campaign {
  id: number;
  title: string;
  status: string;
}

const SharesReport: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await axios.get("campaigns/founder");
        setCampaigns(response.data);
      } catch (err) {
        setError("Failed to fetch campaigns. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  return (
    <Container className="mt-5">
      <h3 className="text-center mb-4">📊 Select a Campaign</h3>

      {loading && (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {error && (
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      )}

      {!loading && !error && campaigns.length === 0 && (
        <Alert variant="info" className="text-center">
          No campaigns found.
        </Alert>
      )}

      {campaigns.map((campaign) => (
        <Card key={campaign.id} className="mb-3 campaign-card">
          <Card.Body>
            <Card.Title className="fw-bold">{campaign.title}</Card.Title>
            <Card.Subtitle className="text-muted">Status: {campaign.status}</Card.Subtitle>
            <div className="d-flex justify-content-end">
              <Link to={`/reports/shares/${campaign.id}`} className="btn btn-outline-primary mt-2">
                View Shares Report
              </Link>
            </div>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
};

export default SharesReport;
