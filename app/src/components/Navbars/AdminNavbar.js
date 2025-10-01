'use client';

import React from "react";
import { Navbar, Container, Nav, Dropdown, Button } from "react-bootstrap";
import { usePathname } from "next/navigation";

export default function AdminNavbar() {
  const pathname = usePathname();

  const mobileSidebarToggle = (e) => {
    e.preventDefault();
    document.documentElement.classList.toggle("nav-open");

    const node = document.createElement("div");
    node.id = "bodyClick";
    node.onclick = function () {
      if (this.parentElement) {
        this.parentElement.removeChild(this);
        document.documentElement.classList.toggle("nav-open");
      }
    };
    document.body.appendChild(node);
  };

  // Map pathname segments to brand text
  const getBrandText = () => {
    if (!pathname) return "Brand";

    if (pathname.includes("/admin/dashboard")) return "Dashboard";
    if (pathname.includes("/admin/user-profile")) return "User Profile";
    if (pathname.includes("/admin/table-list")) return "Table List";
    if (pathname.includes("/admin/typography")) return "Typography";
    if (pathname.includes("/admin/icons")) return "Icons";
    if (pathname.includes("/admin/maps")) return "Maps";
    if (pathname.includes("/admin/notifications")) return "Notifications";

    return "Brand";
  };

  return (
    <Navbar bg="light" expand="lg">
      <Container fluid>
        <div className="d-flex justify-content-center align-items-center ml-2 ml-lg-0">
          <Button
            variant="dark"
            className="d-lg-none btn-fill d-flex justify-content-center align-items-center rounded-circle p-2"
            onClick={mobileSidebarToggle}
          >
            <i className="fas fa-ellipsis-v"></i>
          </Button>
          <Navbar.Brand href="#" onClick={(e) => e.preventDefault()} className="mr-2">
            {getBrandText()}
          </Navbar.Brand>
        </div>

        <Navbar.Toggle aria-controls="basic-navbar-nav" className="mr-2">
          <span className="navbar-toggler-bar burger-lines"></span>
          <span className="navbar-toggler-bar burger-lines"></span>
          <span className="navbar-toggler-bar burger-lines"></span>
        </Navbar.Toggle>

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="nav mr-auto" navbar>
            <Nav.Item>
              <Nav.Link
                data-toggle="dropdown"
                href="#"
                onClick={(e) => e.preventDefault()}
                className="m-0"
              >
                <i className="nc-icon nc-palette"></i>
                <span className="d-lg-none ml-1">Dashboard</span>
              </Nav.Link>
            </Nav.Item>

            <Dropdown as={Nav.Item}>
              <Dropdown.Toggle
                as={Nav.Link}
                data-toggle="dropdown"
                id="dropdown-67443507"
                variant="default"
                className="m-0"
              >
                <i className="nc-icon nc-planet"></i>
                <span className="notification">5</span>
                <span className="d-lg-none ml-1">Notification</span>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {["Notification 1", "Notification 2", "Notification 3", "Notification 4", "Another notification"].map((text, i) => (
                  <Dropdown.Item href="#" key={i} onClick={(e) => e.preventDefault()}>
                    {text}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>

            <Nav.Item>
              <Nav.Link
                className="m-0"
                href="#"
                onClick={(e) => e.preventDefault()}
              >
                <i className="nc-icon nc-zoom-split"></i>
                <span className="d-lg-block"> Search</span>
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Nav className="ml-auto" navbar>
            <Nav.Item>
              <Nav.Link
                className="m-0"
                href="#"
                onClick={(e) => e.preventDefault()}
              >
                <span className="no-icon">Account</span>
              </Nav.Link>
            </Nav.Item>

            <Dropdown as={Nav.Item}>
              <Dropdown.Toggle
                aria-expanded={false}
                aria-haspopup={true}
                as={Nav.Link}
                data-toggle="dropdown"
                id="navbarDropdownMenuLink"
                variant="default"
                className="m-0"
              >
                <span className="no-icon">Dropdown</span>
              </Dropdown.Toggle>

              <Dropdown.Menu aria-labelledby="navbarDropdownMenuLink">
                {["Action", "Another action", "Something", "Something else here"].map((text, i) => (
                  <Dropdown.Item href="#" key={i} onClick={(e) => e.preventDefault()}>
                    {text}
                  </Dropdown.Item>
                ))}
                <div className="divider"></div>
                <Dropdown.Item href="#" onClick={(e) => e.preventDefault()}>
                  Separated link
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <Nav.Item>
              <Nav.Link
                className="m-0"
                href="#"
                onClick={(e) => e.preventDefault()}
              >
                <span className="no-icon">Log out</span>
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
