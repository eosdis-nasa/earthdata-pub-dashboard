import React from 'react';

const snakeToTitleCase = (snakeStr) => {
  if (!snakeStr) return '';
  return snakeStr
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const WorkflowArrowBreadCrumb = ({ steps = [], currentStep = 2 }) => {
  const currentIndex = steps.findIndex(step => step === currentStep);

  return (
    <div style={styles.wrapper}>
      {steps.map((label, index) => {
        const isActive = index === currentIndex;
        const isPast = index < currentIndex;
        const isLast = index === steps.length - 1;
        const isFirst = index === 0;

        const outerClip = isFirst
          ? 'polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)'
          : isLast
          ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 10px 50%)'
          : 'polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%, 10px 50%)';

        const innerClip = outerClip;

        const borderColor = isActive
          ? 'rgb(0, 138, 34)'
          : isPast
          ? '#cccccc'
          : 'rgb(169, 241, 208)';

        const bgColor = isActive
          ? '#158749'
          : isPast
          ? '#f0f0f0'
          : '#e3f1e9';

        const textColor = isActive ? '#fff' : isPast ? '#999' : '#003f63';

        return (
          <React.Fragment key={index}>
            <div
              style={{
                ...styles.outer,
                clipPath: outerClip,
                backgroundColor: borderColor,
              }}
            >
              <div
                style={{
                  ...styles.inner,
                  clipPath: innerClip,
                  backgroundColor: bgColor,
                  color: textColor,
                }}
              >
                <span style={styles.badge}>{index + 1}</span>
                <span style={styles.label}>{snakeToTitleCase(label)}</span>
              </div>
            </div>

            {!isLast && (
              <div style={styles.arrow}>
                <i className="fas fa-arrow-right"></i>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const styles = {
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    rowGap: '20px',
    justifyContent: 'center',
    margin: '20px auto',
    fontFamily: 'Segoe UI, sans-serif',
  },
  arrow: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '20px',
    color: '#aaa',
    margin: '0 5px',
  },
  outer: {
    padding: '2px',
    display: 'inline-block',
    transition: 'all 0.3s ease',
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px 10px 14px',
    minWidth: '160px',
    fontWeight: 500,
    textAlign: 'left',
    transition: 'all 0.3s ease',
  },
  badge: {
    display: 'inline-block',
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    color: '#005ea8',
    fontWeight: 900,
    fontSize: '0.85rem',
    textAlign: 'center',
    lineHeight: '22px',
    flexShrink: 0,
  },
  label: {
    flex: 1,
  },
};

export default WorkflowArrowBreadCrumb;
