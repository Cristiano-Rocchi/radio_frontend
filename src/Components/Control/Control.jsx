import { Col, Container, Row } from "react-bootstrap";
import "./Control.css";

//componenti
import Database from "../Control/Database/Database";
import Playlist from "../Control/Playlist/Playlist";
import { Link } from "react-router-dom";

const Control = () => {
  return (
    <>
      <div className="side-navbar">
        <div className="nav-item">
          <Link to="/">
            <h5>Home</h5>
          </Link>
        </div>
        <div className="nav-item">
          <Link to="/upload">
            <h5>Upload</h5>
          </Link>
        </div>
      </div>

      <Container>
        <Row>
          <Col xs={12} className="border-bottom border-2 border-black">
            <h5 className="text-center">Database</h5>
            <Database />
          </Col>

          <Col xs={12} className="border-bottom border-2 border-black">
            <h5 className="text-center">Playlist</h5>
            <Playlist />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Control;
