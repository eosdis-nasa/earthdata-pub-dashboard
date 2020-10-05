'use strict';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

const API_URL = 'http://localhost:4566/restapis/0ljhig7rqn/prod/_user_request_/information/form?p_key=6c544723-241c-4896-a38c-adbc0a364293';

class TestApi extends React.Component {
    constructor () {
        super();
        this.displayName = 'Test-API';
        this.state = {data: [{id: 'test',}]};
    }

    componentDidMount() {
        fetch(API_URL)
            .then(response => response.json())
            .then(data => this.setState(data))
    }

    render () {
        const { data } = this.state;
        return (
            <div className='page__testApi'>
                <h1>Test-Api</h1>
                <p>{data[0].id}</p>
            </div>
        );
    }
}

export default withRouter(connect(state => state)(TestApi));
