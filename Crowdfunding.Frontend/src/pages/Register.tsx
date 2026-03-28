import React, { useState } from "react";
import axios from "../utils/axios";
import { Form, Button, Container, Alert, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../styles/Register.css";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Investor");
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/auth/register", {
        fullName,
        email,
        password,
        role,
      });
      navigate("/login");
    } catch (err) {
      setError("User already exists or registration failed.");
    }
  };

  return (
    <div className="register-container">
      <Card className="register-card">
        <Card.Body>
          <h2 className="text-center">Register</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleRegister}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="Investor">Investor</option>
                <option value="Founder">Founder</option>
              </Form.Select>
            </Form.Group>
            <Button variant="primary" type="submit" className="register-btn">
              Register
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Register;
