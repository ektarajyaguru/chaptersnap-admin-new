'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/lib/components/ui/card";
import { Badge } from "@/lib/components/ui/badge";
import { Button } from "@/lib/components/ui/button";
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
import { TrendingUp, DollarSign, AlertCircle, Users, RotateCcw } from "lucide-react";

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
  const statsCards = [
    {
      title: 'Number',
      value: '150GB',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Update Now'
    },
    {
      title: 'Revenue',
      value: '$ 1,345',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Update Now'
    },
    {
      title: 'Errors',
      value: '23',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Update Now'
    },
    {
      title: 'Followers',
      value: '+45K',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Update Now'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card, idx) => (
          <Card key={idx}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <RotateCcw className="h-3 w-3" />
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Users Behavior</CardTitle>
            <CardDescription>24 Hours performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData}>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Statistics</CardTitle>
            <CardDescription>Last Campaign Performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                  <RechartsTooltip />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Sales and Tasks Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>2017 Sales</CardTitle>
            <CardDescription>All products including Taxes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="Tesla" fill="#8884d8" />
                <Bar dataKey="BMW" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>Backend development</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Example tasks - you can replace this with your actual tasks */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Complete API integration</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Update user authentication</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Fix responsive layout issues</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
