import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import { Container, Table, Spinner, Alert, Badge, Dropdown, ButtonGroup } from "react-bootstrap";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../styles/Reports.css";

const PaymentsReport: React.FC = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const loggedInUserId = useSelector((state: RootState) => state.auth.user?.id);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get("/reports/payments");

        const userPayments = response.data.filter((payment: any) => payment.investorId === loggedInUserId);
        setPayments(userPayments);
      } catch (err) {
        setError("Failed to load payment reports.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchPayments();
    }
  }, [token, loggedInUserId]);


  const downloadCSV = () => {
    const csvHeaders = "ID,Campaign ID,Amount ($),Equity Allocated (%),Status,Date\n";
    const csvRows = payments
      .map((payment) =>
        `${payment.id},${payment.campaignId},${payment.amount},${payment.equityAllocated},${payment.status},${new Date(payment.createdAt).toLocaleString()}`
      )
      .join("\n");

    const csvData = csvHeaders + csvRows;
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payments_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

 
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Investor Payments Report", 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [["ID", "Campaign ID", "Amount ($)", "Equity Allocated (%)", "Status", "Date"]],
      body: payments.map((payment) => [
        payment.id,
        payment.campaignId,
        `$${payment.amount.toLocaleString()}`,
        `${payment.equityAllocated}%`,
        payment.status,
        new Date(payment.createdAt).toLocaleString(),
      ]),
      theme: "striped",
    });

    doc.save("Payments_Report.pdf");
  };

  return (
    <Container className="reports-container">
      <div className="d-flex justify-content-between align-items-center">
        <h2 className="reports-header">Investor Payments Report</h2>

      
        <Dropdown as={ButtonGroup}>
          <Dropdown.Toggle variant="primary" id="dropdown-basic">
            Download Report
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={downloadPDF}>📄 Download PDF</Dropdown.Item>
            <Dropdown.Item onClick={downloadCSV}>📊 Download CSV</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Campaign ID</th>
              <th>Amount ($)</th>
              <th>Equity Allocated (%)</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td>{payment.id}</td>
                <td>{payment.campaignId}</td>
                <td>${payment.amount.toLocaleString()}</td>
                <td>{payment.equityAllocated}%</td>
                <td>
                  <Badge bg={payment.status === "Success" ? "success" : "danger"}>
                    {payment.status}
                  </Badge>
                </td>
                <td>{new Date(payment.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default PaymentsReport;
