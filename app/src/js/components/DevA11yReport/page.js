'use strict';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { isAdminUser } from '../../utils/privileges';
import pages from './pages';
import { getA11yScan, startA11yPage, startA11yScan, subscribeA11yScan } from './scan';

const DevA11yPage = ({ isAdmin }) => {
  const allowed = isAdmin;
  const [scan, setScan] = useState(getA11yScan());
  const [selected, setSelected] = useState(pages[0][1]);

  useEffect(() => {
    if (!allowed) return undefined;
    startA11yScan();
    return subscribeA11yScan(setScan);
  }, [allowed]);

  const pending = scan.results.reduce((list, page) => {
    const fails = page.checks.filter((item) => !item.pass);
    if (fails.length) list.push({ name: page.name, path: page.path, fails });
    return list;
  }, []);
  const passed = scan.results.filter((page) => page.checks.every((item) => item.pass));
  const tabs = pages.map(([name, path]) => {
    const result = scan.results.find((item) => item.path === path);
    return { name, path, checks: result ? result.checks : null };
  });
  scan.results.forEach((result) => {
    if (!tabs.some((tab) => tab.path === result.path)) {
      tabs.push({ name: result.name, path: result.path, checks: result.checks });
    }
  });
  const active = tabs.find((tab) => tab.path === selected) || tabs[0];
  const done = scan.results.length;
  const total = Math.max(pages.length, done);
  const width = total ? Math.round((done / total) * 100) : 0;

  if (!allowed) {
    return (
      <div className="a11y-report">
        <div className="content__header">
          <div className="row">
            <h1 className="heading--xlarge">508 report</h1>
          </div>
        </div>
        <div className="a11y-report__body">
          <p className="a11y-report__lead">Sign in with an admin account to run this report.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="a11y-report">
      <div className="content__header">
        <div className="row">
          <h1 className="heading--xlarge">508 report</h1>
        </div>
      </div>
      <div className="a11y-report__body">
        <p className="a11y-report__lead">
          Section 508 A and AA, plus the SortSite checks that can run in the browser: NASA header link names, 7:1 contrast (AAA, not a 508 failure), empty table groups, sections without a heading, image size, type under 12pt, short dropdowns, dashed URLs, stylesheets, and the sitemap.
          External link status and spelling stay in SortSite. Switching app sections does not stop the run, and the run does not sign you out.
        </p>
        <div className="a11y-report__stats">
          <div>
            <strong>{pending.reduce((sum, page) => sum + page.fails.length, 0)}</strong>
            <span>Pending</span>
          </div>
          <div>
            <strong>{passed.length}</strong>
            <span>Screens passed</span>
          </div>
          <div>
            <strong>{done} / {total}</strong>
            <span>Screens checked</span>
          </div>
        </div>
        <div className="a11y-report__bar" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}>
          <span style={{ width: `${width}%` }} />
        </div>
        <p className="a11y-report__status">
          {scan.running || !scan.finished
            ? (scan.status || 'Starting')
            : `Finished ${total} screens.`}
        </p>
        <div className="a11y-report__tabs" role="tablist" aria-label="Screens">
          {tabs.map((tab) => {
            const fails = tab.checks ? tab.checks.filter((item) => !item.pass) : null;
            const state = !tab.checks ? 'wait' : (fails.length ? 'fail' : 'pass');
            const open = tab.path === active.path;
            return (
              <button
                key={tab.path}
                type="button"
                role="tab"
                aria-selected={open}
                className={`a11y-report__tab a11y-report__tab--${state}${open ? ' a11y-report__tab--selected' : ''}`}
                onClick={() => setSelected(tab.path)}
              >
                {tab.name}{fails && fails.length ? ` (${fails.length})` : ''}
              </button>
            );
          })}
        </div>
        <section className="a11y-report__panel" role="tabpanel" aria-label={active.name}>
          <div className="a11y-report__panel-head">
            <h2>{active.name}</h2>
            <div className="a11y-report__actions">
              <button
                type="button"
                className="a11y-report__again"
                disabled={scan.running}
                onClick={() => startA11yScan(true)}
              >
                {scan.running && !scan.runningPath ? 'Checking…' : 'Run all'}
              </button>
              <button
                type="button"
                className="a11y-report__again a11y-report__again--quiet"
                disabled={scan.running}
                onClick={() => startA11yPage(active.name, active.path)}
              >
                {scan.runningPath === active.path ? 'Checking…' : 'Run this screen'}
              </button>
            </div>
          </div>
          <p className="a11y-report__path">{active.path}</p>
          {!active.checks
            ? <p className="a11y-report__empty">Not checked yet.</p>
            : active.checks.filter((item) => !item.pass).length === 0
              ? <p className="a11y-report__empty">Nothing pending on this screen.</p>
              : (
                <article className="a11y-report__screen">
                  <ul>
                    {active.checks.filter((item) => !item.pass).map((item) => (
                      <li key={item.title}>
                        <p>{item.title}</p>
                        {item.detail ? <pre>{item.detail}</pre> : null}
                      </li>
                    ))}
                  </ul>
                </article>
              )}
          {active.checks && active.checks.some((item) => item.pass) && (
            <ul className="a11y-report__passed">
              {active.checks.filter((item) => item.pass).map((item) => (
                <li key={item.title}>{item.title}</li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

DevA11yPage.propTypes = {
  isAdmin: PropTypes.bool
};

export default connect((state) => ({
  isAdmin: isAdminUser(state.api.tokens)
}))(DevA11yPage);
