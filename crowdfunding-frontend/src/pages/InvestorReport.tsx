import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../utils/axios";
import { Container, Table, Spinner, Alert, Badge } from "react-bootstrap";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import "../styles/Reports.css";

const InvestorReport: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const token = useSelector((state: RootState) => state.auth.token);
  const [shares, setShares] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShares = async () => {
      try {
        const response = await axios.get(`/reports/shares/${campaignId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setShares(response.data);
      } catch (err) {
        setError("Failed to load shares report.");
      } finally {
        setLoading(false);
      }
    };
    fetchShares();
  }, [campaignId, token]);

  return (
    <Container className="reports-container">
      <h2 className="reports-header">Founder Shares Report</h2>

      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Investor Name</th>
              <th>Amount Invested ($)</th>
              <th>Equity Allocated (%)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {shares.map((share) => (
              <tr key={share.InvestorId}>
                <td>{share.Fullname}</td>
                <td>${share.Amount.toLocaleString()}</td>
                <td>{share.EquityAllocated}%</td>
                <td>
                  <Badge bg={share.Status === "Success" ? "success" : "danger"}>
                    {share.Status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default InvestorReport;
