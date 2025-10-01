'use client';

import React from 'react';
import Link from 'next/link';
import { Nav } from 'react-bootstrap';

// Use the public folder for static images
const logo = '/img/ChapterSnap.png'; // make sure you have public/img/ChapterSnap.png

export default function Sidebar({ color, image }) {
  return (
    <div className="sidebar" data-image={image} data-color={color}>
      {/* Sidebar background */}
      <div
        className="sidebar-background"
        style={{
          backgroundImage: `url(${image})`,
        }}
      />

      <div className="sidebar-wrapper">
        {/* Logo */}
        <div className="logo d-flex align-items-center justify-content-start">
          <div className="logo-img">
            <img src={logo} alt="ChapterSnap Logo" />
          </div>
        </div>

        {/* Navigation links */}
        <Nav as="ul">
          <li>
            <Link href="/admin/dashboard" className="nav-link">
              <i className="nc-icon nc-chart-pie-35" />
              <p>Dashboard</p>
            </Link>
          </li>
          <li>
            <Link href="/admin/publishbooks" className="nav-link">
              <i className="nc-icon nc-simple-add" />
              <p>Publish Books</p>
            </Link>
          </li>
          <li>
            <Link href="/admin/bookslist" className="nav-link">
              <i className="nc-icon nc-notes" />
              <p>Books List</p>
            </Link>
          </li>
          <li>
            <Link href="/admin/categories" className="nav-link">
              <i className="nc-icon nc-align-left-2" />
              <p>Categories</p>
            </Link>
          </li>
          <li>
            <Link href="/admin/banner" className="nav-link">
              <i className="nc-icon nc-simple-add" />
              <p>Banner Image</p>
            </Link>
          </li>
          <li>
            <Link href="/admin/notificationform" className="nav-link">
              <i className="nc-icon nc-bell-55" />
              <p>Notification Form</p>
            </Link>
          </li>
        </Nav>
      </div>
    </div>
  );
}
