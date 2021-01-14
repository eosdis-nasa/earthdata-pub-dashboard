'use strict';
import get from 'lodash.get';

/**
 * Retrieve initial value for component based on react-router's location.
 *
 * @param {Object} props - react component props
 * @returns {string} - value of this component's query string from the url .
 */
export function initialValueFromLocation (props) {
  const { location, paramKey, queryParams } = props;
  return get(location, ['query', paramKey], get(queryParams, paramKey, ''));
}

/**
 * Retrieve initial values for component parameters based on react-router's location.
 *
 * @param {Object} location - react-router's location
 * @param {Array<string>} paramsKeys - list of parameter keys
 * @returns {Object} - object with parameters and values from the url
 */
export function initialValuesFromLocation (location, paramKeys) {
  const initialValues = {};
  paramKeys.forEach((paramKey) => {
    const paramValue = get(location, `query.${paramKey}`, null);
    if (paramValue) {
      initialValues[paramKey] = paramValue;
    }
  });
  return initialValues;
}

/**
 * Check if two URLs have the same origin, only returns true if both URLs are valid and same origin.
 *
 * @param {string} urlOne - the first URL
 * @param {string} urlTwo - the second URL
 */
export function sameOrigin (urlOne, urlTwo) {
  try {
    const originOne = (new URL(urlOne)).origin;
    const originTwo = (new URL(urlTwo)).origin;
    return originOne === originTwo;
  }
  catch (e) {
    return false;
  }
}
