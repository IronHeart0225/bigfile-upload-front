import React from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { serveraddr } from './utils/axios';

import { progressBarFetch, setOriginalFetch, ProgressBar } from "react-fetch-progressbar";

setOriginalFetch(window.fetch);

window.fetch = progressBarFetch;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.handleUploadImage = this.handleUploadImage.bind(this);
  }

  handleUploadImage(ev) {
    ev.preventDefault();

    const data = new FormData();
    data.append('file', this.uploadInput.files[0]);

    fetch(serveraddr + '/upload', {
      method: 'POST',
      body: data,
    })
    .then((response) => {
      response.json().then((body) => {
        
      });
    });
  }

  render() {
    return (
      <>
        <div className='mt-5'>
          <ProgressBar style={{height: '20px' , marginBottom: "20px" }} />
        </div>
        <Container>
          <Row>
            <Col lg={{ offset: 5 }}>
              <Form onSubmit={this.handleUploadImage} className=''>
                <div>
                  <input ref={(ref) => { this.uploadInput = ref; }} type="file" />
                </div>
                <br />
                <div>
                  <button>Upload</button>
                </div>
              </Form>
            </Col>
          </Row>
        </Container>
      </>
    );
  }
}

export default App;