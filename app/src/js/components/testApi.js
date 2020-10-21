'use strict';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

class TestApi extends React.Component {
    constructor () {
        super();
        this.displayName = 'Test-API';
        this.state = {data: [{id: 'test',}]};
        //The below value presumably would normally be passed into this file so that you would dynamically query the desired id
        this.query_id = '6c544723-241c-4896-a38c-adbc0a364293';
        this.url = `http://localhost:4566/restapis/${process.env.APP_ID}/prod/_user_request_/information/form?p_key=${this.query_id}`;
    }

    componentDidMount() {
        fetch(this.url)
            .then(response => response.json())
            .then(data => this.setState(data))
    }

    render () {
        const { data } = this.state;
        return (
            <div className='page__testApi'>
                <p>{this.url}</p>
                <p>{data[0].id}</p>
            </div>
        );
    }
}

export default withRouter(connect(state => state)(TestApi));
