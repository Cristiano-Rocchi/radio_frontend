import React from "react";
import "./Home.css";
import { Col, Container, Row } from "react-bootstrap";

//import
import Homeimg from "../../Assets/Img/home.png";
import Homeimg2 from "../../Assets/Img/home2.png";
const Home = () => {
  return (
    <>
      <Container fluid className="home-container">
        <Row>
          <Col xs={12}>
            <div className="card-home position-relative">
              <img className="first" src={Homeimg} alt="" />
              <img src={Homeimg2} className="second" alt="" />
              <div className="info position-absolute d-flex flex-column justify-content-between ">
                <div className="mt-4">
                  <h1 className="text-center ">Titolo</h1>
                  <h2 className="ms-4 mt-4">Data</h2>
                  <h2 className="ms-4">Artista</h2>
                </div>
                <div className="mb-4">
                  <h3 className="ms-2">Album:</h3>
                  <h3 className="ms-2">Rating:</h3>
                  <h3 className="ms-2">Hidden Gem:</h3>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};
export default Home;
