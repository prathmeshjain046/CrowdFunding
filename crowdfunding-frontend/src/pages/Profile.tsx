import React, { useEffect, useState } from "react";
import { Container, Card, Spinner, Alert, Row, Col, Button, Modal, Form } from "react-bootstrap";
import axios from "../utils/axios";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { PersonCircle, Envelope, ShieldLock, Hash, PencilSquare } from "react-bootstrap-icons";
import "../styles/ProfilePage.css";

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<{ id: number; fullName: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [updatedName, setUpdatedName] = useState("");
  const [updatedPassword, setUpdatedPassword] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("/auth/profile");
        setProfile(response.data);
        setUpdatedName(response.data.fullName);
      } catch (err) {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleUpdateProfile = async () => {
    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateSuccess(null);

    try {
      await axios.put(
        "/auth/update-profile",
        { fullName: updatedName, password: updatedPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUpdateSuccess("Profile updated successfully.");
      setShowModal(false);

      // Refresh profile after update
      setProfile((prev) => prev && { ...prev, fullName: updatedName });
    } catch (err) {
      setUpdateError("Failed to update profile.");
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger" className="text-center">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5 d-flex justify-content-center">
      <Card className="profile-card shadow-lg p-4">
        <Card.Body>
          <div className="text-center mb-4">
            <PersonCircle size={60} className="text-primary" />
            <h4 className="mt-2">{profile?.fullName}</h4>
            <p className="text-muted">{profile?.role}</p>
          </div>

          <Row>
            <Col xs={12} className="mb-3">
              <div className="profile-detail">
                <Hash className="icon" /> <strong>ID:</strong> {profile?.id}
              </div>
            </Col>
            <Col xs={12} className="mb-3">
              <div className="profile-detail">
                <Envelope className="icon" /> <strong>Email:</strong> {profile?.email}
              </div>
            </Col>
            <Col xs={12} className="mb-3">
              <div className="profile-detail">
                <ShieldLock className="icon" /> <strong>Role:</strong> {profile?.role}
              </div>
            </Col>
          </Row>

          <div className="text-center mt-4">
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <PencilSquare className="me-2" /> Edit Profile
            </Button>
          </div>

          {/* Edit Profile Modal */}
          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Edit Profile</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {updateError && <Alert variant="danger">{updateError}</Alert>}
              {updateSuccess && <Alert variant="success">{updateSuccess}</Alert>}

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedName}
                    onChange={(e) => setUpdatedName(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={updatedPassword}
                    onChange={(e) => setUpdatedPassword(e.target.value)}
                    placeholder="Leave blank to keep current password"
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleUpdateProfile} disabled={updateLoading}>
                {updateLoading ? "Updating..." : "Save Changes"}
              </Button>
            </Modal.Footer>
          </Modal>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Profile;
