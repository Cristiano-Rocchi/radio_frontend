import React from "react";
import { Col, Container, Row } from "react-bootstrap";
const Control = () => {
  //State&Hooks

  //Functions

  // effect

  return (
    <>
      <Container>
        <Row>
          <Col xs={12} md={9}>
            <h5 className="text-center">Data</h5>
          </Col>
          <Col xs={12} md={3} className="border-start border-2 border-black">
            <h5 className="text-center">Playlist</h5>
            <p>+ aggiungi playlist</p>
          </Col>
        </Row>
      </Container>
    </>
  );
};
export default Control;
