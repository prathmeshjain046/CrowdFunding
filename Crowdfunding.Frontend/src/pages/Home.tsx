import React from "react";
import { Container, Card } from "react-bootstrap";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import "../styles/Home.css"; 

const Home: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const role = user?.role ?? "";
  const userName = user?.FullName ?? "";

  return (
    <Container className="home-container">
      <div className="welcome-section">
        <h2>🚀 Welcome to Crowdfunding Platform</h2>
        <p>Empowering ideas with funding and collaboration.</p>
      </div>

      {isAuthenticated ? (
        <Card className="home-card shadow-lg">
          <Card.Body>
            <h5>👋 Hello, {userName}!</h5>
            <Card.Text>You are logged in as a <strong>{role}</strong>.</Card.Text>
          </Card.Body>
        </Card>
      ) : (
        <Card className="home-card shadow-lg">
          <Card.Body>
            <h5>🔐 Access Required</h5>
            <Card.Text>Please <strong>log in</strong> to explore campaigns and investments.</Card.Text>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default Home;
