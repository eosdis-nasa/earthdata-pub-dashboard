import React, { useEffect, useState } from "react";



const Reviewers = ({stepName, rawReviewers}) => {
    const [filteredReviewers, setFilteredReviewers] = useState([]);

    function parseStatus(status){
        return status.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    useEffect(() => {
        const reviewers = rawReviewers
            .filter(reviewer => stepName === reviewer.step_name)
            .map(reviewer => {
                return {
                    name: reviewer.name,
                    status: parseStatus(reviewer.user_review_status)
                }
        });
        setFilteredReviewers(reviewers);
    }, [rawReviewers, stepName]);

    return(filteredReviewers.length >0 ?<section className="page__section">
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