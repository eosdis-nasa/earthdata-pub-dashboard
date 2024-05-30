import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { listRequestReviewers } from "../../actions";

const Reviewers = ({requestId, stepNameName}) => {
    const rawReviewers = useSelector(state => state.reviewers);
    const dispatch = useDispatch();
    const [filteredReviewers, setFilteredReviewers] = useState([]);

    useEffect(() => {
        dispatch(listRequestReviewers(requestId));
    }, [requestId]);

    useEffect(() => {
        if(rawReviewers.inflight){
            return;
        }
        if(rawReviewers.error){
            return;
        }
        if(rawReviewers.data){
            const reviewers = rawReviewers.data.map(reviewer => {
                if(stepName === reviewer.step_name){
                    return {
                        name: reviewer.name,
                        status: reviewer.status
                    }
                }
            });
            setFilteredReviewers(reviewers);
        }
    }, [rawReviewers]);

    return(filteredReviewers?<section className="page__section">
        <div className='page__section__header'>
            <h1 className='heading--small heading--shared-content with-description '>
                Reviewers
            </h1>
        </div>
        <div className="page__content--shortened flex__column">
            {
                filteredReviewers.map((reviewer, index) => {
                    return(
                        <div key={index} className="flex__row sm-border">
                            <div className='flex__item--w-25'> {reviewer.name}</div>
                            <div className='flex__item--w-15'> {reviewer.status}</div>
                        </div>
                    );
                })
            }
        </div>
    </section>
    :<></>)

};

export default Reviewers;