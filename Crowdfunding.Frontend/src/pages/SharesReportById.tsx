import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../utils/axios";
import { Container, Table, Spinner, Alert, Badge, Dropdown, Button } from "react-bootstrap";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../styles/Reports.css";

const SharesReportById: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const token = useSelector((state: RootState) => state.auth.token);
  const [shares, setShares] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShares = async () => {
      try {
        const response = await axios.get(`/reports/shares/${campaignId}`);
        setShares(response.data);
      } catch (err) {
        setError("Failed to load shares report.");
      } finally {
        setLoading(false);
      }
    };
    fetchShares();
  }, [campaignId, token]);

  const downloadCSV = () => {
    const csvHeaders = "Investor Name,Amount Invested ($),Equity Allocated (%),Status\n";
    const csvRows = shares.map((share) =>
      `${share.Fullname},${share.Amount},${share.EquityAllocated},${share.Status}`
    ).join("\n");

    const csvData = csvHeaders + csvRows;
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Shares_Report_${campaignId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Founder Shares Report", 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [["Investor Name", "Amount Invested ($)", "Equity Allocated (%)", "Status"]],
      body: shares.map(share => [
        share.Fullname,
        `$${share.Amount.toLocaleString()}`,
        `${share.EquityAllocated}%`,
        share.Status
      ]),
      theme: "striped",
    });

    doc.save(`Shares_Report_${campaignId}.pdf`);
  };


  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center">
        <h2 className="reports-header">📊 Founder Shares Report</h2>

        <Dropdown>
          <Dropdown.Toggle variant="primary">Download Report</Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={downloadCSV}>Download as CSV</Dropdown.Item>
            <Dropdown.Item onClick={downloadPDF}>Download as PDF</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {loading && (
        <div className="d-flex justify-content-center mt-4">
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {error && <Alert variant="danger" className="text-center mt-3">{error}</Alert>}
      {!loading && !error && shares.length === 0 && (
        <Alert variant="info" className="text-center mt-3">No shares report available.</Alert>
      )}

      {!loading && !error && shares.length > 0 && (
        <Table striped bordered hover responsive className="shadow-sm mt-4">
          <thead className="table-dark">
            <tr>
              <th>Investor Name</th>
              <th>Amount Invested ($)</th>
              <th className="text-center">Equity Allocated (%)</th>
              <th className="text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {shares.map((share) => (
              <tr key={share.InvestorId}>
                <td>{share.Fullname}</td>
                <td>${share.Amount.toLocaleString()}</td>
                <td className="text-center">{share.EquityAllocated}%</td>
                <td className="text-center">
                  <Badge bg={share.Status === "Success" ? "success" : "danger"}>{share.Status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default SharesReportById;
