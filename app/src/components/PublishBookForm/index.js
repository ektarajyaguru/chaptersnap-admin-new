import React, { useState } from "react";
import Checkbox from "@mui/material/Checkbox";
import { Form, Row, Col, Card } from "react-bootstrap";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

function PublishBookForm() {
  const categories = [
    { title: "Drama" },
    { title: "Fantasy" },
    { title: "Business" },
  ];
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  return (
    <Col md="">
      <Card>
        <Card.Header>
          <Card.Title as="h4">Add Book</Card.Title>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md="12">
              <Form.Group>
                <Form.Label>Book Name</Form.Label>
                <Form.Control type="text" placeholder="Enter book name" />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md="12">
              <Form.Group>
                <Form.Label>Author</Form.Label>
                <Form.Control type="text" placeholder="Enter author name" />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md="12">
              <Form.Group style={{ marginTop: 15 }}>
                <div>
                  <Autocomplete
                    multiple
                    id="checkboxes-tags-demo"
                    options={categories}
                    disableCloseOnSelect
                    getOptionLabel={(option) => option.title}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox
                          icon={icon}
                          checkedIcon={checkedIcon}
                          style={{ marginRight: 8 }}
                          checked={selected}
                        />
                        {option.title}
                      </li>
                    )}
                    style={{ width: "100%" }}
                    renderInput={(params) => (
                      <TextField {...params} label="Categories" />
                    )}
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md="12">
              <Form.Group>
                <Form.Label>Upload Image</Form.Label>
                <Form.Control
                  style={{ height: "50px" }}
                  className="upload-btn"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Col>
  );
}

export default PublishBookForm;
