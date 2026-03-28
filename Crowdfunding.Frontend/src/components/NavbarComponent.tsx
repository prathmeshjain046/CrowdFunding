import React from "react";
import { Navbar, Nav, Container, Button, NavDropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import { logout } from "../redux/authSlice";
import "../styles/NavbarComponent.css"; 

const NavbarComponent: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const role = user?.role ?? "";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="custom-navbar">
      <Container>
        <Navbar.Brand as={Link} to="/home" className="brand">
          🚀 Crowdfunding
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
  
          <Nav className="me-auto">
            {isAuthenticated && (
              <>
                <Nav.Link as={Link} to="/home" className="nav-link">Home</Nav.Link>

                {role === "Investor" ? (
                  <>
                    <NavDropdown title="Invest" id="invest-dropdown">
                      <NavDropdown.Item as={Link} to="/investments">Invest Campaign</NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/investments/my">My Investments</NavDropdown.Item>
                    </NavDropdown>
                    <NavDropdown title="Reports" id="reports-dropdown">
                      <NavDropdown.Item as={Link} to="/reports">Investment Report</NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/reports/payments">Payment Report</NavDropdown.Item>
                    </NavDropdown>
                  </>
                ) : (
                  <>
                    <NavDropdown title="Campaigns" id="campaign-dropdown">
                      <NavDropdown.Item as={Link} to="/campaign">All Campaigns</NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/campaign/my">My Campaigns</NavDropdown.Item>
                    </NavDropdown>
                    <NavDropdown title="Reports" id="reports-dropdown">
                      <NavDropdown.Item as={Link} to="/reports">Campaign Report</NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/reports/shares">Shares Report</NavDropdown.Item>
                    </NavDropdown>
                  </>
                )}
              </>
            )}
          </Nav>

          {isAuthenticated ? (
            <Nav className="right-nav">
              <Nav.Link as={Link} to="/profile" className="profile-link">Profile</Nav.Link>
              <Button variant="outline-light" onClick={handleLogout} className="logout-btn">
                Logout
              </Button>
            </Nav>
          ) : (
            <Nav>
              <Nav.Link as={Link} to="/login" className="nav-link">Login</Nav.Link>
              <Nav.Link as={Link} to="/register" className="nav-link">Register</Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;
