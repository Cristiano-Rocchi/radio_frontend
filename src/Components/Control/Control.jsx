import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import "./Control.css";

//componenti
import Database from "../Control/Database/Database";

const Control = () => {
  return (
    <>
      <Container>
        <Row>
          <Col xs={12} className="border-bottom border-2 border-black">
            <h5 className="text-center">Database</h5>
            <Database />
          </Col>

          <Col xs={12} className="border-bottom border-2 border-black">
            <h5 className="text-center">Playlist</h5>
            <p>+ aggiungi playlist</p>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Control;
