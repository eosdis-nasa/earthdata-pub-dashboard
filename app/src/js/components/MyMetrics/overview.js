'use strict';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  BarChart, Bar, Tooltip, Legend, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, LabelList
} from 'recharts';
import { listRequests } from '../../actions';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import { daacOptionNames } from '../../selectors';
import './chart.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTable, faChartBar } from '@fortawesome/free-solid-svg-icons';

const DAAC_COLORS = [
  '#d88c9a',
  '#a3c4bc',
  '#9a8c98',
  '#f2d7b6',
  '#c3aed6',
  '#adc178',
  '#ffb3c6',
  '#a8dadc',
  '#e5c3a6'
];

const STATUS_COLORS = [
  '#d8a7f9',
  '#ffb6c1',
  '#87ceeb',
  '#ff9a8b',
  '#f4d35e',
  '#90be6d',
  '#cfac8e',
  '#ffcab1',
  '#7ea8be'
];

const MetricOverview = ({ privileges, dispatch, requests }) => {
  useEffect(() => {
    if (!(requests && requests.list.data && requests.list.data.length > 0)) dispatch(listRequests());
  }, [dispatch, requests]);

  const [viewMode, setViewMode] = useState({ daac: 'chart', step: 'chart', stacked: 'chart', close: 'table' });
  const [hoveredStep, setHoveredStep] = useState(null);

  const [chartsData, setChartsData] = useState({
    daacData: [],
    statusData: [],
    stackedData: [],
    daacColors: {},
    stepNameColors: {},
    requestMapping: {},
    closeRequests: []
  });
  
  const [closeRequests, setCloseRequests] = useState([]);
  useEffect(() => {
    if (!requests.list || !requests.list.data) return;

    const formatStepName = (stepName) => stepName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    const requestData = requests.list.data.filter(req => req.initiator?.id === privileges);
    const daacOptions = daacOptionNames();
    const daacMap = Object.fromEntries(daacOptions.map(option => [option.value, option.label]));

    const daacCounts = {}, stepNameCounts = {}, stackedData = {};
    const requestMappingDaac = {};   // Separate mapping for DAACs
    const requestMappingStep = {};   // Separate mapping for Step Names
    const requestMappingStacked = {}; // Separate mapping for Stacked Data

    const uniqueDaacIds = [...new Set(requestData.map(r => r.daac_id))];
    const uniqueStepNames = [...new Set(requestData.map(r => formatStepName(r.step_name || "Unknown Step")))];

    let daacColors = {};
    uniqueDaacIds.forEach((daac, index) => {
        daacColors[daacMap[daac] || "Unknown"] = DAAC_COLORS[index % DAAC_COLORS.length];
    });

    let stepNameColors = {};
    uniqueStepNames.forEach((step, index) => {
        stepNameColors[step] = STATUS_COLORS[index % STATUS_COLORS.length];
    });

    requestData.forEach(request => {
        const daac_id = request.daac_id;
        const daac_label = daacMap[daac_id] || "Unknown";
        const step_name = formatStepName(request.step_name || "Unknown Step");

        // Count per DAAC
        if (!daacCounts[daac_label]) daacCounts[daac_label] = { daac_name: daac_label, count: 0 };
        daacCounts[daac_label].count += 1;

        // Count per Step Name
        if (!stepNameCounts[step_name]) stepNameCounts[step_name] = { step_name, count: 0 };
        stepNameCounts[step_name].count += 1;

        // Ensure all DAACs have all step names in stacked chart
        if (!stackedData[daac_label]) {
            stackedData[daac_label] = { daac_name: daac_label };
            uniqueStepNames.forEach(step => {
                stackedData[daac_label][step] = 0;
            });
        }
        stackedData[daac_label][step_name] += 1;

        // Store request IDs under DAAC names
        if (!requestMappingDaac[daac_label]) {
            requestMappingDaac[daac_label] = new Set(); // Use Set to prevent duplicates
        }
        requestMappingDaac[daac_label].add(request.id);

        // Store request IDs under Step Names
        if (!requestMappingStep[step_name]) {
            requestMappingStep[step_name] = new Set();
        }
        requestMappingStep[step_name].add(request.id);

        // Store request IDs for Stacked Chart
        if (!requestMappingStacked[daac_label]) {
            requestMappingStacked[daac_label] = {};
        }
        if (!requestMappingStacked[daac_label][step_name]) {
            requestMappingStacked[daac_label][step_name] = new Set();
        }
        requestMappingStacked[daac_label][step_name].add(request.id);
    });

    // Convert Sets to arrays before setting state
    const formattedRequestMappingDaac = {};
    const formattedRequestMappingStep = {};
    const formattedRequestMappingStacked = {};

    Object.keys(requestMappingDaac).forEach(daac => {
        formattedRequestMappingDaac[daac] = Array.from(requestMappingDaac[daac]);
    });

    Object.keys(requestMappingStep).forEach(step => {
        formattedRequestMappingStep[step] = Array.from(requestMappingStep[step]);
    });

    Object.keys(requestMappingStacked).forEach(daac => {
        formattedRequestMappingStacked[daac] = {};
        Object.keys(requestMappingStacked[daac]).forEach(step => {
            formattedRequestMappingStacked[daac][step] = Array.from(requestMappingStacked[daac][step]);
        });
  });

  // Time Taken for Close Requests
  const closeRequests = requestData
    .filter(req => req.step_name === "close")
    .map(req => {
        const createdAt = new Date(req.created_at);
        const lastChange = new Date(req.last_change);
        const durationMs = lastChange - createdAt;

        const days = Math.floor(durationMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);

        const options = { year: 'numeric', month: 'short', day: 'numeric', 
                          hour: '2-digit', minute: '2-digit', second: '2-digit', 
                          timeZoneName: 'short' };

        return {
            id: req.id,
            daacName: req.daac_name || "Unknown",  // Include DAAC Name
            startTime: new Intl.DateTimeFormat('en-US', options).format(createdAt),
            endTime: new Intl.DateTimeFormat('en-US', options).format(lastChange),
            timeTaken: `${days}d ${hours}h ${minutes}m ${seconds}s`,
        };
    });

  setCloseRequests(closeRequests);
  setChartsData({
      daacData: Object.values(daacCounts),
      statusData: Object.values(stepNameCounts),
      stackedData: Object.values(stackedData),
      daacColors,
      stepNameColors,
      requestMappingDaac: formattedRequestMappingDaac,
      requestMappingStep: formattedRequestMappingStep,
      requestMappingStacked: formattedRequestMappingStacked
  });
}, [requests.list]);

const toggleView = (type) => {
  setViewMode(prev => ({ ...prev, [type]: prev[type] === 'chart' ? 'table' : 'chart' }));
};

const CustomTick = (props) => {
  const { x, y, payload } = props;
  const truncatedValue = payload.value.length > 15 ? `${payload.value.substring(0, 15)}...` : payload.value;

  return (
    <g transform={`translate(${x},${y})`}>
      <title>{payload.value}</title>
      <text x={0} y={0} dy={10} textAnchor="middle" fontSize="12">
        {truncatedValue}
      </text>
    </g>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{
        backgroundColor: "white",
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "5px",
        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)"
      }}>
        <p style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "5px" }}>{label}</p>
      
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color, margin: "2px 0", fontSize: "12px" }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

return (
  <div className='page__component'>
    <section className='page__section page__section__controls'>
      <Breadcrumbs config={[{ label: 'Dashboard Home', href: '/' }, { label: 'My Metrics', active: true }]} />
    </section>

    <div className="total-count">
    Total requests submitted across all DAACs:
      <span className="count-number">
        {chartsData.daacData.reduce((sum, d) => sum + d.count, 0)}
      </span>
    </div>

    {/* Count per DAAC */}
    <div className="chart-box">
      <h2 style={{ fontSize: "1.4rem", fontWeight: "bold", color: "black", textAlign: "center" }}>
        TOTAL REQUESTS SUBMITTED PER DAAC
      </h2>
      <p style={{ textAlign: "center", fontSize: "0.9rem", color: "#555" }}>
        Breakdown of the total count per DAAC.
      </p>

      <div className="toggle-container">
        <button onClick={() => toggleView('daac')} className="toggle-switch">
          {viewMode.daac === 'chart' ? (
            <FontAwesomeIcon icon={faTable} title="Switch to Table View" className="toggle-icon" />
          ) : (
            <FontAwesomeIcon icon={faChartBar} title="Switch to Chart View" className="toggle-icon" />
          )}
        </button>
      </div>

      {chartsData.daacData.length === 0 ? (
        <div className="no-data">No Data Available</div>
        ) : viewMode.daac === 'chart' ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartsData.daacData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="daac_name" tick={<CustomTick />} interval={0} />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count">
              <LabelList dataKey="count" position="top" />
              {chartsData.daacData.map((entry) => (
                <Cell key={entry.daac_name} fill={chartsData.daacColors[entry.daac_name]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        ) : (
        <table className="styled-table">
          <thead>
            <tr>
              <th>DAAC Name</th>
              <th>Request IDs</th>
            </tr>
          </thead>
          <tbody>
            {chartsData.daacData.map((entry) => (
              <tr key={entry.daac_name}>
                <td>{entry.daac_name}</td>
                <td>
                  {chartsData.requestMappingDaac[entry.daac_name]?.length > 0 ? (
                    chartsData.requestMappingDaac[entry.daac_name].map((id) => (
                      <Link key={id} to={`/requests/id/${id}`} style={{ marginRight: '10px' }}>
                        {id}
                      </Link>
                    ))
                  ) : (
                    <span style={{ color: 'red' }}>No Requests</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>

      {/* Count per Step Name */}
      <div className="chart-box">
        <h2 style={{ fontSize: "1.4rem", fontWeight: "bold", color: "black", textAlign: "center" }}>
          TOTAL REQUESTS COUNT PER STEP NAME
        </h2>
        <p style={{ textAlign: "center", fontSize: "0.9rem", color: "#555" }}>
        Breakdown of the total count per Step Name.
        </p>
        <div className="toggle-container">
          <button onClick={() => toggleView('step')} className="toggle-switch">
            {viewMode.step === 'chart' ? (
              <FontAwesomeIcon icon={faTable} title="Switch to Table View" className="toggle-icon" />
            ) : (
              <FontAwesomeIcon icon={faChartBar} title="Switch to Chart View" className="toggle-icon" />
            )}
          </button>
        </div>
  
        {chartsData.statusData.length === 0 ? (
            <div className="no-data">No Data Available</div>
          ) : viewMode.step === 'chart' ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartsData.statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="step_name" tick={<CustomTick />} interval={0} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count">
                  <LabelList dataKey="count" position="top" />
                  {chartsData.statusData.map((entry) => (
                    <Cell key={entry.step_name} fill={chartsData.stepNameColors[entry.step_name]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Step Name</th>
                  <th>Request IDs</th>
                </tr>
              </thead>
              <tbody>
                {chartsData.statusData.map((entry) => (
                  <tr key={entry.step_name}>
                    <td>{entry.step_name}</td>
                    <td>
                      {chartsData.requestMappingStep[entry.step_name]?.length > 0 ? (
                        chartsData.requestMappingStep[entry.step_name].map((id) => (
                          <Link key={id} to={`/requests/id/${id}`} style={{ marginRight: '10px' }}>
                            {id}
                          </Link>
                        ))
                      ) : (
                        <span style={{ color: 'red' }}>No Requests</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>

      {/* Stacked Bar Chart */}
      <div className="chart-box">
        <h2 style={{ fontSize: "1.4rem", fontWeight: "bold", color: "black", textAlign: "center" }}>
          TOTAL STEP NAME COUNT PER DAAC
        </h2>
        <p style={{ textAlign: "center", fontSize: "0.9rem", color: "#555" }}>
          Stacked bar chart shows the count of step name per DAAC.
        </p>

        <div className="toggle-container">
          <button onClick={() => toggleView('stacked')} className="toggle-switch">
            {viewMode.stacked === 'chart' ? (
              <FontAwesomeIcon icon={faTable} title="Switch to Table View" className="toggle-icon" />
            ) : (
              <FontAwesomeIcon icon={faChartBar} title="Switch to Chart View" className="toggle-icon" />
            )}
          </button>
        </div>

        {chartsData.stackedData.length === 0 ? (
            <div className="no-data">No Data Available</div>
          ) : viewMode.stacked === 'chart' ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart 
                data={chartsData.stackedData} 
                onMouseMove={(e) => setHoveredStep(e?.activeLabel)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="daac_name" tick={<CustomTick />} interval={0}/>
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {Object.keys(chartsData.stackedData[0] || {}).map((stepName) => {
                  if (stepName !== "daac_name") {
                    return (
                      <Bar 
                        key={stepName} 
                        dataKey={stepName} 
                        stackId="a"
                        fill={chartsData.stepNameColors[stepName]} 
                      />
                    );
                  }
                  return null;
                })}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <table className="styled-table">
              <thead>
                <tr>
                  <th>DAAC Name</th>
                  <th>Step Name</th>
                  <th>Request IDs</th>
                </tr>
              </thead>
              <tbody>
                {chartsData.stackedData.map(daac =>
                  Object.keys(daac)
                    .filter(step => step !== "daac_name" && daac[step] > 0)
                    .map(step => (
                      <tr key={`${daac.daac_name}-${step}`}>
                        <td>{daac.daac_name}</td>
                        <td>{step}</td>
                        <td>
                          {chartsData.requestMappingStacked[daac.daac_name]?.[step]?.length > 0 ? (
                            chartsData.requestMappingStacked[daac.daac_name][step].map(id => (
                              <Link key={id} to={`/requests/id/${id}`} style={{ marginRight: '10px' }}>
                                {id}
                              </Link>
                            ))
                          ) : (
                            <span style={{ color: 'red' }}>No Requests</span>
                          )}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          )}
      </div>

      {/* Table for Step "Close" Requests */}
      <div className="chart-box">
        <h2 style={{ fontSize: "1.4rem", fontWeight: "bold", color: "black", textAlign: "center" }}>
          TOTAL TIME FOR CLOSE REQUESTS
        </h2>
        {closeRequests.length === 0 ? (
          <div className="no-data">No Close Requests Data</div>
        ) : (
          <table className="request-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>DAAC Name</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Total Time</th>
              </tr>
            </thead>
            <tbody>
              {closeRequests.map((req) => (
                <tr key={req.id}>
                  <td>
                    <Link to={`/requests/id/${req.id}`} aria-label="View your request details">
                      {req.id}
                    </Link>
                  </td>
                  <td>{req.daacName}</td>
                  <td>{req.startTime}</td>
                  <td>{req.endTime}</td>
                  <td>{req.timeTaken}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
