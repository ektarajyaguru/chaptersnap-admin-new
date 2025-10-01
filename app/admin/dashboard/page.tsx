'use client';

import React from 'react';
import {
  Badge,
  Button,
  Card,
  Navbar,
  Nav,
  Table,
  Container,
  Row,
  Col,
  Form,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

const lineData = [
  { time: '9AM', series1: 287, series2: 67, series3: 23 },
  { time: '12AM', series1: 385, series2: 152, series3: 113 },
  { time: '3PM', series1: 490, series2: 143, series3: 67 },
  { time: '6PM', series1: 492, series2: 240, series3: 108 },
  { time: '9PM', series1: 554, series2: 287, series3: 190 },
  { time: '12PM', series1: 586, series2: 335, series3: 239 },
  { time: '3AM', series1: 698, series2: 435, series3: 307 },
  { time: '6AM', series1: 695, series2: 437, series3: 308 },
];

const pieData = [
  { name: 'Open', value: 40 },
  { name: 'Bounce', value: 20 },
  { name: 'Unsubscribe', value: 40 },
];

const COLORS = ['#00C49F', '#FF8042', '#FFBB28'];

const barData = [
  { month: 'Jan', Tesla: 542, BMW: 412 },
  { month: 'Feb', Tesla: 443, BMW: 243 },
  { month: 'Mar', Tesla: 320, BMW: 280 },
  { month: 'Apr', Tesla: 780, BMW: 580 },
  { month: 'May', Tesla: 553, BMW: 453 },
  { month: 'Jun', Tesla: 453, BMW: 353 },
  { month: 'Jul', Tesla: 326, BMW: 300 },
  { month: 'Aug', Tesla: 434, BMW: 364 },
  { month: 'Sep', Tesla: 568, BMW: 368 },
  { month: 'Oct', Tesla: 610, BMW: 410 },
  { month: 'Nov', Tesla: 756, BMW: 636 },
  { month: 'Dec', Tesla: 895, BMW: 695 },
];

export default function Dashboard() {
  return (
    <Container fluid>
      <Row>
        {/* Stats Cards */}
        {[
          { title: 'Number', value: '150GB', icon: 'nc-chart text-warning' },
          { title: 'Revenue', value: '$ 1,345', icon: 'nc-light-3 text-success' },
          { title: 'Errors', value: '23', icon: 'nc-vector text-danger' },
          { title: 'Followers', value: '+45K', icon: 'nc-favourite-28 text-primary' },
        ].map((card, idx) => (
          <Col lg="3" sm="6" key={idx}>
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className={`nc-icon ${card.icon}`}></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">{card.title}</p>
                      <Card.Title as="h4">{card.value}</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr />
                <div className="stats">
                  <i className="fas fa-redo mr-1"></i>
                  Update Now
                </div>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>

      <Row>
        <Col md="8">
          <Card>
            <Card.Header>
              <Card.Title as="h4">Users Behavior</Card.Title>
              <p className="card-category">24 Hours performance</p>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineData} margin={{ right: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="series1" stroke="#8884d8" />
                  <Line type="monotone" dataKey="series2" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="series3" stroke="#ffc658" />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col md="4">
          <Card>
            <Card.Header>
              <Card.Title as="h4">Email Statistics</Card.Title>
              <p className="card-category">Last Campaign Performance</p>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md="6">
          <Card>
            <Card.Header>
              <Card.Title as="h4">2017 Sales</Card.Title>
              <p className="card-category">All products including Taxes</p>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} margin={{ right: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="Tesla" fill="#8884d8" />
                  <Bar dataKey="BMW" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Tasks Card (unchanged) */}
        <Col md="6">
          <Card className="card-tasks">
            <Card.Header>
              <Card.Title as="h4">Tasks</Card.Title>
              <p className="card-category">Backend development</p>
            </Card.Header>
            <Card.Body>
              {/* Keep your existing tasks table here */}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
