import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import { Container, Card, Spinner, Alert, Table } from "react-bootstrap";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { BarChart, ClipboardData, CurrencyDollar, ListCheck } from "react-bootstrap-icons";
import "../styles/Reports.css"; 

const Reports: React.FC = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get("/reports/dashboard");
        setReportData(response.data);
      } catch (err) {
        setError("Failed to load report data.");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [token]);

  if (loading)
    return (
      <Container className="report-container text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );

  if (error)
    return (
      <Container className="report-container text-center">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );

  return (
    <Container className="report-container">
      <h2 className="text-center report-title">
        <BarChart className="icon-title" /> Dashboard Report
      </h2>
      {reportData?.totalCampaignsCreated !== undefined ? (
        <FounderReport data={reportData} />
      ) : (
        <InvestorReport data={reportData} />
      )}
    </Container>
  );
};

const FounderReport: React.FC<{ data: any }> = ({ data }) => (
  <>
    <Card className="summary-card">
      <Card.Body>
        <h4 className="summary-title">
          <ClipboardData className="icon-summary" /> Founder Summary
        </h4>
        <p>
          <strong>Total Campaigns Created:</strong> {data.totalCampaignsCreated}
        </p>
        <p>
          <strong>Total Amount Invested:</strong> ${data.totalAmountInvested.toLocaleString()}
        </p>
      </Card.Body>
    </Card>
    {data.campaigns.map((campaign: any, index: number) => (
      <CampaignCard key={index} campaign={campaign} isFounder />
    ))}
  </>
);

const InvestorReport: React.FC<{ data: any }> = ({ data }) => (
  <>
    <Card className="summary-card">
      <Card.Body>
        <h4 className="summary-title">
          <CurrencyDollar className="icon-summary" /> Investor Summary
        </h4>
        <p>
          <strong>Total Amount Invested:</strong> ${data.totalAmountInvested.toLocaleString()}
        </p>
        <p>
          <strong>Total Campaigns Invested:</strong> {data.totalCampaignsInvested}
        </p>
      </Card.Body>
    </Card>
    {data.campaigns.map((campaign: any, index: number) => (
      <CampaignCard key={index} campaign={campaign} />
    ))}
  </>
);

const CampaignCard: React.FC<{ campaign: any; isFounder?: boolean }> = ({ campaign, isFounder = false }) => (
  <Card className="campaign-card">
    <Card.Body>
      <h5 className="campaign-title">
        <ListCheck className="icon-campaign" /> {campaign.title}
      </h5>
      <p>
        <strong>Date Listed:</strong> {new Date(campaign.dateListed).toLocaleDateString()}
      </p>
      <p>
      </p>
      {isFounder ? (
        <>
          <p>
            <strong>Remaining Amount Needed:</strong> ${campaign.remainingAmountNeeded.toLocaleString()}
          </p>
          {campaign.investments.length > 0 && (
            <Table striped bordered hover className="investment-table">
              <thead>
                <tr>
                  <th>Investor Name</th>
                  <th>Amount Invested</th>
                  <th>Investment Date</th>
                  <th>Alloted Equity</th>
                </tr>
              </thead>
              <tbody>
                {campaign.investments.map((inv: any, idx: number) => (
                  <tr key={idx}>
                    <td>{inv.investorName}</td>
                    <td>${inv.amountInvested.toLocaleString()}</td>
                    <td>{new Date(inv.investmentDate).toLocaleDateString()}</td>
                    <td>{inv.allotedEquity}%</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
      ) : (
        <>
          <p>
            <strong>Investment Date:</strong> {new Date(campaign.investmentDate).toLocaleDateString()}
          </p>
          <p>
            <strong>Investment Status:</strong> {campaign.investmentStatus}
          </p>
          <p>
            <strong>Amount Invested:</strong> ${campaign.amountInvested.toLocaleString()}
          </p>
          <p>
            <strong>Campaign Status:</strong> {campaign.campaignStatus}
          </p>
        </>
      )}
    </Card.Body>
  </Card>
);

export default Reports;
