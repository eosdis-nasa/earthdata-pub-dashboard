import React from "react";

const Reviewers = ({reviewers}) => {

    return(reviewers?<section className="page__section">
        <div className='page__section__header'>
            <h1 className='heading--small heading--shared-content with-description '>
                Roles
            </h1>
        </div>
        <div className="page__content--shortened flex__column">
            {
                reviewers.map((reviewer, index) => {
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