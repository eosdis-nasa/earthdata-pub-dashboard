'use strict';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  BarChart, Bar, Tooltip, Legend, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, LabelList
} from 'recharts';
import { listRequests, listCloudMetrics, listInactiveRequests } from '../../actions';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import { daacOptionNames } from '../../selectors';
import './chart.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTable, faChartBar } from '@fortawesome/free-solid-svg-icons';

const DAAC_COLORS = [
  '#d88c9a', '#a3c4bc', '#9a8c98', '#f2d7b6', '#c3aed6', '#adc178', '#ffb3c6', '#a8dadc', '#e5c3a6',
  '#e67e22', '#8e44ad', '#d35400', '#c0392b', '#16a085', '#f39c12', '#2c3e50', '#bdc3c7', '#7f8c8d'
];

const STATUS_COLORS = [
  '#d8a7f9', '#ffb6c1', '#87ceeb', '#ff9a8b', '#f4d35e', '#90be6d', '#cfac8e', '#ffcab1', '#7ea8be',
  '#e6a8ff', '#ffa07a', '#b5e7a0', '#f7cac9', '#ffdd94', '#98ddca', '#ffb3ba', '#c4a7e7', '#b0d7ff'
];

const MetricOverview = ({ privileges, dispatch, requests, metrics }) => {
  const [viewMode, setViewMode] = useState({ daac: 'chart', step: 'chart', stacked: 'chart', close: 'table' });
  const [hoveredStep, setHoveredStep] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sourceData, setSourceData] = useState([]);
  const [dataReady, setDataReady] = useState(false);

  const [chartsData, setChartsData] = useState({
    daacData: [],
    statusData: [],
    stackedData: [],
    daacColors: {},
    stepNameColors: {},
    requestMapping: {},
    closeRequests: []
  });
  const ROW_INCREMENT = 5;

  const [daacFilter, setDaacFilter] = useState({
  start: '',
  end: ''
});


// State for request status filter
const [statusFilter, setStatusFilter] = useState("all"); // all | active | withdrawn | closed

useEffect(() => {
  let cancelled = false;

  const fetchBoth = async () => {
    try {
      const [active, inactive] = await Promise.all([
        dispatch(listRequests()),
        dispatch(listInactiveRequests())
      ]);

      if (!cancelled) {
        setSourceData([
          ...(active?.data || []),
          ...(inactive?.data || [])
        ]);
        setDataReady(true);
      }
    } catch (e) {
      if (!cancelled) {
        console.error(e);
        setSourceData([]);
        setDataReady(true);
      }
    }
  };

  fetchBoth();
  return () => { cancelled = true; };
}, [dispatch]);


useEffect(() => {
  if (!dataReady) return;

  const formatStepName = (stepName) =>
    stepName.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  // ==============================
  // DAAC / STEP / STACKED DATA
  // ==============================
  let requestData = [...sourceData];
  if (statusFilter === "active") {
    requestData = requestData.filter(
      (req) => req.step_name?.toLowerCase() !== "close" && req.hidden === false
    );
  } else if (statusFilter === "withdrawn") {
    requestData = requestData.filter((req) => req.hidden === true);
  } else if (statusFilter === "closed") {
    requestData = requestData.filter((req) => req.step_name?.toLowerCase() === "close");
  }

  const daacOptions = daacOptionNames();
  const daacMap = Object.fromEntries(daacOptions.map((option) => [option.value, option.label]));

  
  // Apply DAAC date filter
  let filteredDaacRequests = requestData;

  if ((daacFilter.start || daacFilter.end)) {
    const startDate = daacFilter.start ? new Date(daacFilter.start) : null;
    const endDate = daacFilter.end ? new Date(daacFilter.end) : null;
  if (endDate) {
    endDate.setDate(endDate.getDate() + 1); // add 1 day
    endDate.setHours(23, 59, 59, 999);
  }

  filteredDaacRequests = requestData.filter((req) => {
    const createdAt = new Date(req.created_at);
    const lastChange = new Date(req.last_change);
    const isAfterStart = startDate ? createdAt >= startDate : true;
    const isBeforeEnd = endDate ? lastChange <= endDate : true;
    return isAfterStart && isBeforeEnd;
  });
  }


  // Set DAAC date range only first time
  if (filteredDaacRequests.length > 0 && !daacFilter.start && !daacFilter.end) {
    const validCreatedDates = filteredDaacRequests
      .map(r => new Date(r.created_at))
      .filter(d => !isNaN(d));

    const validLastChangeDates = filteredDaacRequests
      .map(r => new Date(r.last_change))
      .filter(d => !isNaN(d));

    if (validCreatedDates.length > 0 && validLastChangeDates.length > 0) {
      const earliest = new Date(Math.min(...validCreatedDates));
      const latest = new Date(Math.max(...validLastChangeDates));

      const formatDate = (date) => {
        if (!(date instanceof Date) || isNaN(date)) return '';
        return date.toISOString().split("T")[0];
      };

      setDaacFilter({ start: formatDate(earliest), end: formatDate(latest) });
    }
  }


  const uniqueDaacIds = [...new Set(filteredDaacRequests.map((r) => r.daac_id))];
  const uniqueStepNames = [...new Set(filteredDaacRequests.map((r) => formatStepName(r.step_name || "Unknown Step")))];

  let daacColors = {};
  uniqueDaacIds.forEach((daac, index) => {
    daacColors[daacMap[daac] || "Unknown"] = DAAC_COLORS[index % DAAC_COLORS.length];
  });

  let stepNameColors = {};
  uniqueStepNames.forEach((step, index) => {
    stepNameColors[step] = STATUS_COLORS[index % STATUS_COLORS.length];
  });

  const daacCounts = {}, stepNameCounts = {}, stackedData = {};
  const requestMappingDaac = {}, requestMappingStep = {}, requestMappingStacked = {};

  filteredDaacRequests.forEach((request) => {
    const daac_id = request.daac_id;
    const daac_label = daacMap[daac_id] || "Unknown";
    const step_name = formatStepName(request.step_name || "Unknown Step");

    if (!daacCounts[daac_label]) daacCounts[daac_label] = { daac_name: daac_label, count: 0 };
    daacCounts[daac_label].count += 1;

    if (!stepNameCounts[step_name]) stepNameCounts[step_name] = { step_name, count: 0 };
    stepNameCounts[step_name].count += 1;

    if (!stackedData[daac_label]) {
      stackedData[daac_label] = { daac_name: daac_label };
      uniqueStepNames.forEach((step) => (stackedData[daac_label][step] = 0));
    }
    stackedData[daac_label][step_name] += 1;

    if (!requestMappingDaac[daac_label]) requestMappingDaac[daac_label] = new Set();
    requestMappingDaac[daac_label].add(request.id);

    if (!requestMappingStep[step_name]) requestMappingStep[step_name] = new Set();
    requestMappingStep[step_name].add(request.id);

    if (!requestMappingStacked[daac_label]) requestMappingStacked[daac_label] = {};
    if (!requestMappingStacked[daac_label][step_name]) requestMappingStacked[daac_label][step_name] = new Set();
    requestMappingStacked[daac_label][step_name].add(request.id);
  });

  const formattedRequestMappingDaac = {};
  const formattedRequestMappingStep = {};
  const formattedRequestMappingStacked = {};

  Object.keys(requestMappingDaac).forEach((daac) => {
    formattedRequestMappingDaac[daac] = Array.from(requestMappingDaac[daac]);
  });
  Object.keys(requestMappingStep).forEach((step) => {
    formattedRequestMappingStep[step] = Array.from(requestMappingStep[step]);
  });
  Object.keys(requestMappingStacked).forEach((daac) => {
    formattedRequestMappingStacked[daac] = {};
    Object.keys(requestMappingStacked[daac]).forEach((step) => {
      formattedRequestMappingStacked[daac][step] = Array.from(requestMappingStacked[daac][step]);
    });
  });

  setChartsData((prev) => ({
    ...prev,
    daacData: Object.values(daacCounts),
    statusData: Object.values(stepNameCounts),
    stackedData: Object.values(stackedData),
    daacColors,
    stepNameColors,
    requestMappingDaac: formattedRequestMappingDaac,
    requestMappingStep: formattedRequestMappingStep,
    requestMappingStacked: formattedRequestMappingStacked,
    allData: sourceData
  }));
  setLoading(false);
}, [daacFilter, statusFilter, dataReady]);


const [visibleRows, setVisibleRows] = useState({
  daac: ROW_INCREMENT,
  step: ROW_INCREMENT,
  stacked: ROW_INCREMENT,
  close: ROW_INCREMENT,
});


const toggleView = (type) => {
  setViewMode(prev => ({ ...prev, [type]: prev[type] === 'chart' ? 'table' : 'chart' }));

  if (viewMode[type] === 'chart') {
    setVisibleRows(prev => ({ ...prev, [type]: ROW_INCREMENT }));
  }
};

const handleShowMore = (table) => {
  setVisibleRows(prev => ({
    ...prev,
    [table]: prev[table] + ROW_INCREMENT,
  }));
};

const handleShowLess = (table) => {
  setVisibleRows(prev => ({
    ...prev,
    [table]: Math.max(ROW_INCREMENT, prev[table] - ROW_INCREMENT),
  }));
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

const flattenedData = chartsData.stackedData.flatMap(daac =>
  Object.keys(daac)
    .filter(step => step !== "daac_name" && daac[step] > 0)
    .map(step => ({
      daacName: daac.daac_name,
      stepName: step,
      requestIds: chartsData.requestMappingStacked?.[daac.daac_name]?.[step] || []
    }))
);


const formatDuration = (start, end) => {
  const durationMs = end - start;
  const days = Math.floor(durationMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

return (
  <div className='page__component'>
    <section className='page__section page__section__controls'>
      <Breadcrumbs config={[{ label: 'Dashboard Home', href: '/' }, { label: 'My Metrics', active: true }]} />
    </section>

    {loading ? (
          <div className="loading-spinner">Loading Metrics...</div>
        ) : (
              <div className="metrics-overview-wrapper">
      {/* ===== Total Count ===== */}
      <div className="total-count">
        {`Total ${
          statusFilter === "all"
            ? "requests submitted"
            : statusFilter === "active"
            ? "active requests submitted"
            : statusFilter === "withdrawn"
            ? "withdrawn requests submitted"
            : "requests closed"
        } across all DAACs:`}
        <span className="count-number">
          {chartsData.daacData.reduce((sum, d) => sum + d.count, 0)}
        </span>
      </div>

      {/* ===== Shared Filters ===== */}
      <div className="shared-filters" style={{ marginBottom: "20px" }}>
        {/* Status Filter */}
        <label>Filter by Status:</label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="withdrawn">Withdrawn</option>
          <option value="closed">Closed</option>
        </select>

        {/* DAAC Date Filter */}
        <label style={{ marginLeft: "20px" }}>Start Date:</label>
        <input
          type="date"
          value={daacFilter.start}
          onChange={(e) => setDaacFilter(prev => ({ ...prev, start: e.target.value }))}
        />
        <label>End Date:</label>
        <input
          type="date"
          value={daacFilter.end}
          onChange={(e) => setDaacFilter(prev => ({ ...prev, end: e.target.value }))}
        />
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

        {viewMode.daac === 'table' && 
          <span className='request-name-warning'>
            *Form's Request Name field has not yet been populated
          </span>
        }

        {chartsData.daacData.length === 0 ? (
          <div className="no-data">No Data Available</div>
          ) : viewMode.daac === 'chart' ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartsData.daacData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="daac_name" tick={false} interval={0} />
              <YAxis allowDecimals={false}/>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                payload={chartsData.daacData.map((entry) => ({
                  value: entry.daac_name,
                  type: "square",
                  color: chartsData.daacColors[entry.daac_name]
                }))}
              />
              <Bar dataKey="count">
                <LabelList dataKey="count" position="top" />
                {chartsData.daacData.map((entry) => (
                  <Cell key={entry.daac_name} fill={chartsData.daacColors[entry.daac_name]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          ) : (
            <>
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>DAAC Name</th>
                    <th>Request Name(s)</th>
                    {statusFilter === "closed" && (
                      <>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Total Time</th>
                      </>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {
                    (() => {
                      const daacRows = chartsData.daacData
                        .slice(0, visibleRows.daac)
                        .flatMap((entry) => {
                          const requestsForDaac = chartsData.requestMappingDaac[entry.daac_name] || [];

                          if (requestsForDaac.length > 0) {
                            return requestsForDaac.map((id, idx) => {
                              const result = chartsData?.allData?.find(item => item.id === id);
                              const label = result?.name
                                ? result.name
                                : result?.initiator?.name
                                ? `Request Initialized by ${result.initiator.name}*`
                                : id;

                              return (
                                <tr key={`${entry.daac_name}-${id}`}>
                                  <td>{idx === 0 ? entry.daac_name : ""}</td>
                                  <td>
                                    <Link to={`/requests/id/${id}`} title={`Request Id: ${id}`}>
                                      {label}
                                    </Link>
                                  </td>
                                  {statusFilter === "closed" && result && (
                                    <>
                                      <td>{new Date(result.created_at).toLocaleString()}</td>
                                      <td>{new Date(result.last_change).toLocaleString()}</td>
                                      <td>{formatDuration(new Date(result.created_at), new Date(result.last_change))}</td>
                                    </>
                                  )}
                                </tr>
                              );
                            });
                          } else {
                            return [];
                          }
                        });

                      return daacRows.length > 0 ? (
                        daacRows
                      ) : (
                        <tr>
                          <td colSpan={statusFilter === "closed" ? 5 : 2} className="no-data">
                            No Close Requests
                          </td>
                        </tr>
                      );
                    })()
                  }
                </tbody>
              </table>

              {/* Show More & Show Less Buttons */}
              {chartsData.daacData.length > ROW_INCREMENT && (
                <div className="button-container">
                  {visibleRows.daac < chartsData.daacData.length && (
                    <button className="show-more-button" onClick={() => handleShowMore('daac')}>
                      Show More
                    </button>
                  )}
                  {visibleRows.daac > ROW_INCREMENT && (
                    <button className="show-less-button" onClick={() => handleShowLess('daac')}>
                      Show Less
                    </button>
                  )}
                </div>
              )}
            </>
          )}
      </div>

      {/* Count per Step Name */}
          {statusFilter !== "closed" && (<div className="chart-box">
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
  
        {viewMode.step === 'table' && 
          <span className='request-name-warning'>
            *Form's Request Name field has not yet been populated
          </span>
        }

        {chartsData.statusData.length === 0 ? (
            <div className="no-data">No Data Available</div>
          ) : viewMode.step === 'chart' ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartsData.statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="step_name" tick={false} interval={0} />
                <YAxis allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  payload={chartsData.statusData.map((entry) => ({
                    value: entry.step_name,
                    type: "square",
                    color: chartsData.stepNameColors[entry.step_name]
                  }))}
                />
                <Bar dataKey="count">
                  <LabelList dataKey="count" position="top" />
                  {chartsData.statusData.map((entry) => (
                    <Cell key={entry.step_name} fill={chartsData.stepNameColors[entry.step_name]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <>
              <table className="styled-table">
              <thead>
                <tr>
                  <th>Step Name</th>
                  <th>Request Name(s)</th>
                  {statusFilter === "closed" && (
                    <>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Total Time</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {chartsData.statusData.slice(0, visibleRows.step).map((entry) => {
                  const requestsForStep = chartsData.requestMappingStep[entry.step_name] || [];

                  return requestsForStep.length > 0 ? (
                    requestsForStep.map((id, idx) => {
                      const step_result = chartsData?.allData?.find(item => item.id === id);
                      const label = step_result?.name
                        ? step_result.name
                        : step_result?.initiator?.name
                        ? `Request Initialized by ${step_result.initiator.name}*`
                        : id;

                      return (
                        <tr key={`${entry.step_name}-${id}`}>
                          {/* Show step name only on first row */}
                          <td>{idx === 0 ? entry.step_name : ""}</td>

                          <td>
                            <Link to={`/requests/id/${id}`} title={`Request Id: ${id}`}>
                              {label}
                            </Link>
                          </td>

                          {statusFilter === "closed" && step_result && (
                            <>
                              <td>{new Date(step_result.created_at).toLocaleString()}</td>
                              <td>{new Date(step_result.last_change).toLocaleString()}</td>
                              <td>{formatDuration(new Date(step_result.created_at), new Date(step_result.last_change))}</td>
                            </>
                          )}
                        </tr>
                      );
                    })
                  ) : (
                    <tr key={entry.step_name}>
                      <td>{entry.step_name}</td>
                      <td style={{ color: 'red' }}>No Requests</td>
                      {statusFilter === "closed" && (
                        <>
                          <td>-</td>
                          <td>-</td>
                          <td>-</td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>

              {/* Show More/Less Buttons */}
              {chartsData.statusData.length > ROW_INCREMENT && (
                <div className="button-container">
                  {visibleRows.step < chartsData.statusData.length && (
                    <button className="show-more-button" onClick={() => handleShowMore('step')}>
                      Show More
                    </button>
                  )}
                  {visibleRows.step > ROW_INCREMENT && (
                    <button className="show-less-button" onClick={() => handleShowLess('step')}>
                      Show Less
                    </button>
                  )}
                </div>
              )}
            </>
          )}
      </div>
      )}
      
      {statusFilter !== "closed" && (
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

        {viewMode.stacked === 'table' && (
          <span className='request-name-warning'>
            *Form's Request Name field has not yet been populated
          </span>
        )}

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
              <YAxis allowDecimals={false}/>
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
          <>
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Daac Name</th>
                  <th>Step Name</th>
                  <th>Request Name(s)</th>
                  {statusFilter === "closed" && (
                    <>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Total Time</th>
                    </>
                  )}
                </tr>
              </thead>

              <tbody>
                {
                  (() => {
                    const stackedRows = flattenedData
                      .slice(0, visibleRows.stacked)
                      .flatMap((entry) => {
                        if (entry.requestIds.length === 0) return [];

                        return entry.requestIds.map((id, idx) => {
                          const result = chartsData?.allData?.find(item => item.id === id);
                          const label = result?.name
                            ? result.name
                            : result?.initiator?.name
                            ? `Request Initialized by ${result.initiator.name}*`
                            : id;

                          return (
                            <tr key={`${entry.stepName}-${id}`}>
                              <td>{idx === 0 ? entry.daacName : ""}</td>
                              <td>{idx === 0 ? entry.stepName : ""}</td>
                              <td>
                                <Link to={`/requests/id/${id}`} title={`Request Id: ${id}`}>
                                  {label}
                                </Link>
                              </td>
                              {statusFilter === "closed" && result && (
                                <>
                                  <td>{new Date(result.created_at).toLocaleString()}</td>
                                  <td>{new Date(result.last_change).toLocaleString()}</td>
                                  <td>{formatDuration(
                                    new Date(result.created_at),
                                    new Date(result.last_change)
                                  )}</td>
                                </>
                              )}
                            </tr>
                          );
                        });
                      });

                    return stackedRows.length > 0 ? (
                      stackedRows
                    ) : (
                      <tr>
                        <td colSpan={statusFilter === "closed" ? 6 : 3} className="no-data">
                          No Requests Available for Stacked View
                        </td>
                      </tr>
                    );
                  })()
                }
              </tbody>
            </table>

            {flattenedData.length > ROW_INCREMENT && (
              <div className="button-container">
                {visibleRows.stacked < flattenedData.length && (
                  <button className="show-more-button" onClick={() => handleShowMore('stacked')}>
                    Show More
                  </button>
                )}
                {visibleRows.stacked > ROW_INCREMENT && (
                  <button className="show-less-button" onClick={() => handleShowLess('stacked')}>
                    Show Less
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
      )}
    </div>
    )}
  </div>
);
};

MetricOverview.propTypes = {
  dispatch: PropTypes.func,
  requests: PropTypes.object,
  privileges: PropTypes.string,
  metrics: PropTypes.object,
};

export default withRouter(connect(state => ({
  privileges: state.api.tokens.userId,
  metrics: state.metrics,
  requests: state.requests,
}))(MetricOverview));