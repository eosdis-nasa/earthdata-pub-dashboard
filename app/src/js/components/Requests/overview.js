'use strict';
import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  // getCount,
  // searchRequests,
  // clearRequestsSearch,
  // filterRequests,
  // clearRequestsFilter,
  //listRequests,
  // filterStatuses,
  // clearStagesFilter,
  // clearStatusesFilter,
  // listWorkflows,
  // getOptionsRequestName,
} from '../../actions';
// import { get } from 'object-path';
import {
  lastUpdated,
  // tally,
  // displayCase
} from '../../utils/format';
import {
  tableColumns
} from '../../utils/table-config/requests';
import List from '../Table/Table';
import Select from 'react-select';
// import Search from '../Search/search';
// import Overview from '../Overview/overview';
// import statusOptions from '../../utils/status';
// import stageOptions from '../../utils/stage';
import _config from '../../config';
import { strings } from '../locale';
import { workflowOptionNames } from '../../selectors';
// import { window } from '../../utils/browser';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
// import pageSizeOptions from '../../utils/page-size';
import { requestPrivileges } from '../../utils/privileges';
import Loading from '../LoadingIndicator/loading-indicator';
import Meditor from '../MeditorModal/modal';
import { useListRequestsQuery } from '../../feature/api/rtkApiSlice';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';

// *** MUI Table set up ***
//  ** MUI Columns ***

const columns = [
  { field: 'dataProduct', headerName: 'Data Product', flex: 1},
  { field: 'dataProducer', headerName: 'Data Producer', flex: 1},
  { field: 'status', headerName: 'Status', flex: 1 },
  { field: 'workflow_name', headerName: 'Workflow', flex: 1 },
  { field: 'created_at', headerName: 'Created', flex: 1 },
  { field: 'last_change', headerName: 'Last Edited', flex: 1, sortingOrder: ['asc', 'desc'] },
  { field: 'conversation_id', headerName: 'Conversation', flex: 1 },
  { field: 'step_name', headerName: 'Next Action', flex: 1 },
]


const breadcrumbConfig = [
  {
    label: 'Dashboard Home',
    href: '/'
  },
  {
    label: 'Requests',
    href: '/requests'
  },
  {
    label: strings.requests_inprogress2,
    href: '/requests',
    active: true
  }
];

function RequestsOverview (props) {
  const [producers, setProducers] = useState([]);
  const [originalList, setOriginalList] = useState([]);
  const [list, setList] = useState([]);
  const [queriedAt, setQueriedAt] = useState('');


  const {
    data: requests,
    isSuccess: requestIsSuccess,
    isError: requestIsError,
    error: requestsError,
  } = useListRequestsQuery({},{refetchOnMountOrArgChange: false});

  useEffect(() => {
    if (requestIsSuccess){
      console.log(requests);
      const tmpOriginalList = requests;
      console.log(tmpOriginalList);
      const tmpList = parseList(tmpOriginalList);
      setOriginalList(tmpOriginalList);
      setList(tmpList);
      setQueriedAt( new Date().toJSON())
    }
    
  }, [requests]);


  function generateQuery () {
    return {};
  }

  function parseList (list) {
    const parsedList = [];
    for (let submission in list) {
      let record = list[submission];
      if (!record.hidden && record.step_name !== 'close' && typeof record === 'object'){
        var dataProduct = record.form_data?.data_product_name_value;
        if (dataProduct === undefined) {
          dataProduct = `Request Initialized by ${record.initiator.name}`;
        }
        const dataProducer = record.form_data?.data_producer_info_name? record.form_data.data_producer_info_name : ''
        record = {...record, dataProduct: dataProduct, dataProducer: dataProducer}
        parsedList.push(record);
      }
    }
    return parsedList;
  }

  function filter(baseList, match) {
    const newList = [];
    const tmp = [];
    let requestSearchValue = '';
    if (document.querySelector('.request-section input.search') !== undefined && document.querySelector('.request-section input.search') !== null) {
      requestSearchValue = document.querySelector('.request-section input.search').value;
    }
    const re = new RegExp(requestSearchValue, 'gi');
    for (const submission in baseList) {
      if (!submission.hidden && submission.step_name !== 'close' && typeof submission === 'object') {
        if (match === undefined && this.state.filter !== undefined && this.state.filter.length > 0) {
          match = this.state.filter;
        }
        const prod = { value: submission.form_data?.data_producer_info_name, label: submission.form_data?.data_producer_info_name };
        let dataProduct = submission.form_data?.data_product_name_value;
        if (dataProduct === undefined) {
          dataProduct = `Request Initialized by ${submission.initiator.name}`;
        }
        const isFound = producers.some(element => {
          if (element.value === prod.value) {
            return true;
          }
          return false;
        });
        if (!isFound && JSON.stringify(prod) !== '{}') {
          producers.push(prod);
        }
        if ((requestSearchValue !== '' && dataProduct.match(re)) || requestSearchValue === '') {
          if (match === undefined) {
            tmp.push(submission);
          } else {
            for (const i in match) {
              if (prod.value === match[i].value) {
                tmp.push(submission);
              }
            }
          }
        }
      }
    }
    // for (const ea in baseList) {
    //   const record = baseList[ea];
    //   newList[ea] = record;
    //   for (const r in record) {
    //     if (!record[r].hidden && record[r].step_name !== 'close' && typeof record[r] === 'object') {
    //       if (match === undefined && this.state.filter !== undefined && this.state.filter.length > 0) {
    //         match = this.state.filter;
    //       }
    //       const prod = { value: record[r].form_data?.data_producer_info_name, label: record[r].form_data?.data_producer_info_name };
    //       let dataProduct = record[r].form_data?.data_product_name_value;
    //       if (dataProduct === undefined) {
    //         dataProduct = `Request Initialized by ${record[r].initiator.name}`;
    //       }
    //       const isFound = producers.some(element => {
    //         if (element.value === prod.value) {
    //           return true;
    //         }
    //         return false;
    //       });
    //       if (!isFound && JSON.stringify(prod) !== '{}') {
    //         producers.push(prod);
    //       }
    //       if ((requestSearchValue !== '' && dataProduct.match(re)) || requestSearchValue === '') {
    //         if (match === undefined) {
    //           tmp.push(record[r]);
    //         } else {
    //           for (const i in match) {
    //             if (prod.value === match[i].value) {
    //               tmp.push(record[r]);
    //             }
    //           }
    //         }
    //       }
    //     }
    //   }
    // }
    // Object.defineProperty(newList, 'data', {
    //   value: tmp,
    //   writable: true,
    //   enumerable: true,
    //   configurable: true
    // });
    return tmp;
  }

  function handleProducerSelect (list, e) {
    if (e.length === 0) {
      setList(filter(originalList));
    } else if (e[0] !== undefined) {
      setList(filter(originalList, Object.values(e)));
    }
  }
    

  if (list !== undefined && list.meta !== undefined && list.data !== undefined) {
    if (document.querySelector('.request-section input.search') !== undefined && document.querySelector('.request-section input.search') !== null) {
      const searchElement = document.querySelector('.request-section input.search');

      searchElement.addEventListener('change', () => {
        setList(filter(originalList));
      });
    }
    const query = generateQuery();
    const { canInitialize } = requestPrivileges(props.privileges);
    const initiateRequestSelectDaac = `${_config.formsUrl}${_config.initiateRequestSelectDaac}`;
    const constList = list;
    const unique = [...new Set(constList.map(item => item.id))];

    return (
      <div className='page__component'>
        <section className='page__section page__section__controls'>
          <Breadcrumbs config={breadcrumbConfig} />
        </section>
        <section className='page__section page__section__header-wrapper'>
          <div className='page__section__header'>
            <h1 className='heading--large heading--shared-content with-description '>{strings.requests}</h1>
            {lastUpdated(queriedAt)}
            {/* <Overview items={overviewItems} inflight={false} /> */}
          </div>
        </section>
        <section className='page__section page__section__controls request-section'>
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium heading--shared-content with-description'>{strings.all_requests} <span className='num--title'>{unique.length}</span></h2>
            { canInitialize ? <a className='button button--small button--green button--add-small form-group__element--right new-request-button' href={initiateRequestSelectDaac} aria-label="Create new request">New Request</a> : null }
          </div>
          {!list
            ? <Loading />
            : <List
                list={list}
                tableColumns={tableColumns}
                query={query}
                rowId='id'
                filterIdx='name'
                filterPlaceholder='Search Requests'
              >
              <Select
                id="producerSelect"
                options={producers}
                onChange={(e) => handleProducerSelect(originalList, e)}
                isSearchable={true}
                placeholder='Select Data Producer'
                className='selectButton'
                aria-label='Select Data Producer'
                isMulti={true}
              />
              </List>
          }
        </section>
        <Meditor></Meditor>
      </div>
    );
  }
  // if (document.querySelector('.request-section input.search') !== undefined && document.querySelector('.request-section input.search') !== null) {
  //   const searchElement = document.querySelector('.request-section input.search');

  //   searchElement.addEventListener('change', () => {
  //     setList(filter(originalList));
  //   });
  // }
  // const query = generateQuery();
  const { canInitialize } = requestPrivileges(props.privileges);
  const initiateRequestSelectDaac = `${_config.formsUrl}${_config.initiateRequestSelectDaac}`;
  const constList = list;
  const unique = [...new Set(constList.map(item => item.id))];

  return (
  <div className='page__component'>
      <section className='page__section page__section__controls'>
        <Breadcrumbs config={breadcrumbConfig} />
      </section>
      <section className='page__section page__section__header-wrapper'>
        <div className='page__section__header'>
          <h1 className='heading--large heading--shared-content with-description '>{strings.requests}</h1>
          {lastUpdated(queriedAt)}
          {/* <Overview items={overviewItems} inflight={false} /> */}
        </div>
      </section>
      <section className='page__section page__section__controls request-section'>
        <div className='heading__wrapper--border'>
          <h2 className='heading--medium heading--shared-content with-description'>{strings.all_requests} <span className='num--title'>{unique.length}</span></h2>
          { canInitialize ? <a className='button button--small button--green button--add-small form-group__element--right new-request-button' href={initiateRequestSelectDaac} aria-label="Create new request">New Request</a> : null }
        </div>
        <DataGrid
          rows={list}
          columns={columns}
          initialState={{
            
            pagination: {
              paginationModel:{
                pageSize: 10,
              }
            }
          }}
          pageSizeOptions={[5, 10, 20, 30, 40, 50]}
        />
        {/* {!list
          ? <Loading />
          : <List
              list={list}
              tableColumns={tableColumns}
              query={query}
              rowId='id'
              filterIdx='name'
              filterPlaceholder='Search Requests'
            >
            <Select
              id="producerSelect"
              options={producers}
              onChange={(e) => handleProducerSelect(originalList, e)}
              isSearchable={true}
              placeholder='Select Data Producer'
              className='selectButton'
              aria-label='Select Data Producer'
              isMulti={true}
            />
            </List>
        } */}
      </section>
      <Meditor></Meditor>
    </div>
  )
}

RequestsOverview.propTypes = {
  requests: PropTypes.object,
  stats: PropTypes.object,
  dispatch: PropTypes.func,
  workflowOptions: PropTypes.array,
  location: PropTypes.object,
  config: PropTypes.object,
  requestCSV: PropTypes.object,
  privileges: PropTypes.object,
  roles: PropTypes.array
};

export { RequestsOverview };

export default withRouter(connect(state => ({
  stats: state.stats,
  workflowOptions: workflowOptionNames(state),
  requests: state.requests,
  config: state.config,
  requestCSV: state.requestCSV,
  privileges: state.api.tokens.privileges,
  roles: state.api.tokens.roles
}))(RequestsOverview));
