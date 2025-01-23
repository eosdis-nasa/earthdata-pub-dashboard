'use strict';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  BarChart, Bar, Tooltip, Legend, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, LabelList
} from 'recharts';
import { listCloudMetrics, listWorkflows } from '../../actions';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';

// Define distinct colors for DAACs
const DAAC_COLORS = [
  '#007acc', '#f39c12', '#2ecc71', '#e74c3c', '#9b59b6', '#34495e', '#ff5733', '#33FF57', '#FF33A8'
];

// Define distinct colors for step_names (statuses)
const STATUS_COLORS = [
  '#8884d8', '#82ca9d', '#FF5733', '#FFB233', '#33A1FF', '#A833FF', '#33FF57', '#6b5b95'
];

// Custom Tooltip for "Count per Status per DAAC"
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { daac_name } = payload[0].payload;
    return (
      <div className="custom-tooltip" style={{ backgroundColor: '#ffffff', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>DAAC: {daac_name}</p>
        {payload.map((entry) => (
          <p key={entry.name} style={{ color: entry.color, margin: '2px 0' }}>
            <strong>{entry.name}:</strong> {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const MetricOverview = ({ privileges, dispatch, requests }) => {
  useEffect(() => {
    dispatch(listWorkflows());
    dispatch(listCloudMetrics());
  }, [dispatch]);

  const [chartsData, setChartsData] = useState({
    daacData: [],
    statusData: [],
    statusByDaacData: [],
    stepNameByDaacData: [],
    totalDaacCount: 0,
    daacColors: {},
    stepNameColors: {},
  });

  const [activeDaac, setActiveDaac] = useState(null);

  const handleSubmit = () => {
    if (!requests.list || !requests.list.data) {
      console.warn("No request data available to filter.");
      return;
    }

    const requestData = requests.list.data;
    const filteredRequests = requestData.filter(request => request.initiator && request.initiator.id === privileges);

    console.log("Filtered Requests:", filteredRequests);

    const daacCounts = {}, stepNameCounts = {}, stepNameByDaacCounts = {};
    const uniqueDaacNames = [...new Set(filteredRequests.map(r => r.daac_name))];
    const uniqueStepNames = [...new Set(filteredRequests.map(r => r.step_name || "Unknown Step"))];

    let daacColors = {};
    uniqueDaacNames.forEach((daac, index) => {
      daacColors[daac] = DAAC_COLORS[index % DAAC_COLORS.length];
    });

    let stepNameColors = {};
    uniqueStepNames.forEach((step, index) => {
      stepNameColors[step] = STATUS_COLORS[index % STATUS_COLORS.length];
    });

    filteredRequests.forEach(request => {
      const stepName = request.step_name || "Unknown Step"; // Using step_name

      // Count per DAAC
      if (!daacCounts[request.daac_name]) {
        daacCounts[request.daac_name] = {
          daac_name: request.daac_name,
          count: 0
        };
      }
      daacCounts[request.daac_name].count += 1;

      // Count per Step Name
      if (!stepNameCounts[stepName]) {
        stepNameCounts[stepName] = { step_name: stepName, count: 0 };
      }
      stepNameCounts[stepName].count += 1;

      // Group by DAAC & step_name for stacked chart
      if (!stepNameByDaacCounts[request.daac_name]) {
        stepNameByDaacCounts[request.daac_name] = { daac_name: request.daac_name };
      }

      if (!stepNameByDaacCounts[request.daac_name][stepName]) {
        stepNameByDaacCounts[request.daac_name][stepName] = 0;
      }
      stepNameByDaacCounts[request.daac_name][stepName] += 1;
    });

    setChartsData({
      daacData: Object.values(daacCounts),
      statusData: Object.values(stepNameCounts),
      statusByDaacData: Object.values(stepNameByDaacCounts),
      stepNameByDaacData: Object.values(stepNameByDaacCounts),
      totalDaacCount: filteredRequests.length,
      daacColors,
      stepNameColors,
    });
  };

  useEffect(() => {
    handleSubmit();
  }, []);

  // Handle click on DAAC to activate/deactivate
  const handleDaacClick = (daacName) => {
    setActiveDaac((prev) => (prev === daacName ? null : daacName));
  };

  return (
    <div className='page__component'>
      <section className='page__section page__section__controls'>
        <Breadcrumbs config={[{ label: 'Dashboard Home', href: '/' }, { label: 'My Metrics', active: true }]} />
      </section>

      <h2 className="total-count">Total Count for All DAACs: {chartsData.totalDaacCount}</h2>

      {/* DAAC Color Legend */}
      <div className="daac-legend">
        <h4>DAAC Legend (Click to Highlight)</h4>
        <ul>
          {Object.entries(chartsData.daacColors).map(([daacName, color]) => (
            <li
              key={daacName}
              style={{
                color: activeDaac === null || activeDaac === daacName ? color : "#ccc",
                fontWeight: activeDaac === daacName ? 'bold' : 'normal',
                cursor: 'pointer'
              }}
              onClick={() => handleDaacClick(daacName)}
            >
              <span style={{
                display: 'inline-block',
                width: 15,
                height: 15,
                backgroundColor: color,
                marginRight: 10,
                border: activeDaac === daacName ? "2px solid black" : "none"
              }}></span>
              {daacName}
            </li>
          ))}
        </ul>
      </div>

      <div className="chart-grid">
        {/* Count per DAAC */}
        <div className="chart-box">
          <h3>Count per DAAC</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartsData.daacData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="daac_name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count">
                <LabelList dataKey="count" position="top" />
                {chartsData.daacData.map((entry) => (
                  <Cell key={entry.daac_name} fill={chartsData.daacColors[entry.daac_name]} />
                 ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Count per Step Name (Status) */}
        <div className="chart-box">
          <h3>Count per Step Name</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartsData.statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="step_name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count">
                <LabelList dataKey="count" position="top" />
                {chartsData.statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
    </div>
  );
};

MetricOverview.propTypes = {
    dispatch: PropTypes.func,
    requests: PropTypes.object,
    privileges: PropTypes.string,
  };
  
  export default withRouter(connect(state => ({
    requests: state.requests,
    privileges: state.api.tokens.userId,
  }))(MetricOverview));
  