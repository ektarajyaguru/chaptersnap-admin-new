import React, { useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import { Col, Form } from "react-bootstrap";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function SummaryForm() {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Col md="12">
      <div>
        <Accordion
          sx={{ width: "900px", marginTop: "20px" }}
          expanded={expanded === "panel1"}
          onChange={handleChange("panel1")}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <Typography sx={{ color: "text.secondary" }}>
              <input placeholder=" ex. 2 min" />
            </Typography>
            <Typography
              sx={{
                color: "text.secondary",
                marginTop: "4px",
                marginLeft: "15px",
              }}
            >
              Add Summary Here
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              <Form.Control as="textarea" />
            </Typography>
          </AccordionDetails>
        </Accordion>
      </div>
    </Col>
  );
}

export default SummaryForm;
