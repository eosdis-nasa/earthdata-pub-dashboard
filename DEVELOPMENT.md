# Development Guide

## Adding a new page

### 1. Create the component

Components can be an entire page, or a portion of a page. Component files go in
`app/src/js/components`. If the component has many child components (a page with
charts, tables, etc) then consider making a separate directory. In the case of the
submissions component:

- `app/src/js/components/submissions/index.js` is the parent or main page.
- A search component could live in `app/src/js/components/submissions/search.js`.
- A bar chart component that is shared with other pages could live in `app/src/js/components/charts/bar.js`.

If a component is very simple, it may not need a unique directory, and can be simply
`app/src/js/components/404.js`, for example.

### 2. Add the component to the router

The router tells the app what the component's URL should be. In our app, a route
looks like a line of HTML, so we'll call them elements. A route element requires
at minimum `path` and `component` properties. Path defines the url path, and component
is the name of the component.

When one route is nested within another route, the urls stack. In the following
example, the list component's path is `/submissions/list`.

```html
<Route path='/submissions' component={Submissions}>
   <Route path='/list' component={List} />
</Route>
```

The routes are all defined in `app/src/js/App.js`. Make sure to `import` the necessary
component at the top of the file.

```javascript
import Submissions from './components/submissions'
import List from './components/submissions/list'
```

More on imports: if the name of the file is `index.js`, you don't need to spell it
out, and can instead specify the name of the parent directory. You also don't need
to include the file extension (assuming it's `.js`).

For more on Router, including how to pass variables in the url, see the [list of
react documentation](https://reactjs.org/community/courses.html).

### 3. Linking to the component

Instead of using `<a href="path/to/component">` tags, we use
`<Link to="path/to/component" />`. This gives us a few convenience features.
Just remember to import the Link module:

```javascript
import { Link } from 'react-router-dom';
```

## Writing an API query

To write an API query, we need to write actions and reducers.

Actions let the interface initiate requests. A good example: a submit button calls
an action to initiate a GET. Once the API returns that data, we call another action
to place it in the store, along with an accompanying identifier.

Finally, we write a reducer to identify this action and optionally manipulate the
data before assigning it a namespaced location.

**A high-level example**:

1. User navigates to the `submissions` page, which starts a request to list all
active submissions.
2. The API responds, and we assign the data to `store.api.submissions` as an array
with format `[{ id: 1 }, { id: 2 }, { id: 3 }, ...]`.
3. The active submissions page displays a table by accessing `this.props.submissions`.
The user clicks on a single submission to go to `submissions/1`.
4. The single submission component decides whether the submission `{ id: 1 }` exists
in `this.props`; if it does, it renders using that data. Otherwise, it initiates
a new GET request.

### Writing actions

We might want to write an action to query a single submission by id. To do this,
we create a function in `src/js/actions/index.js`.

```javascript
export const getSubmission = function (submissionId) {
  return function (dispatch) {
    // do ajax query
    request.get(submissionId, function (err, resp) {
      if (err) { console.log(err); }
      dispatch(setSubmission(submissionId, resp[0]));
    })
  };
}
```

Note, `dispatch` allows us to write async actions.

We'll need another action to send this data to the store. Note, we probably don't
need to export this action. In the same file:

```javascript
function setSubmission (id, submissionData) {
  return { type: UPDATE_SUBMISSION, id: id, data: submissionData };
}
```

This sends the submission data to the store. We need to specify the primary key
so we can identify this action in a reducer function, and place it appropriately.
In `actions.js`:

```javascript
export const UPDATE_SUBMISSION = 'UPDATE_SUBMISSION';
```

Now in `reducers/api.js` we import the primary key and export a reducer function,
which receives the current state, and the reducer in question. We use a primary key,
because every action is sent to every reducer. The reducer doesn't manipulate the
current state, but rather returns a new state object that includes the new data.

```javascript
import { UPDATE_SUBMISSION } from '../actions';
export function reducer (currentState, action) {
  const newState = Object.assign({}, currentState);
  if (action.type === UPDATE_SUBMISSION) {
    newState.submissionDetail[action.id] = action.data;
  }
  return newState;
};
```

Finally, this allows us to access the data from a component, where component state
is passed as a `prop`:

```javascript
// import the action so we can call it
import { getSubmission } from '../actions';

const Submission = React.createClass({

  componentWillMount: function () {
    // params are passed as props to each component,
    // and id is the namespace for the route in `src/js/main.js`.
    const submissionId = this.props.params.id;
    getSubmission(submissionId);
  },

  render: function () {
    const submissionId = this.props.params.id;
    const submission = this.props.submissions[submissionId]; // should use object-path#get for this
    if (!submission) {
      return <div></div>; // return empty since we have no data yet
    }
    return <div className='submission'>{submission.submissionId}</div>;
  }
});
```

### Accessing Data from a Local EDPUB API

#### Writing the Source Code

When writing the source code, the main differences will be in the fetch url which
should point to localhost:4566. An example of source code for pulling data from a
local EDPUB API instance can be found at ./app/src/js/components/testApi.js with
some of the main differences in the snippet below

```javascript
 constructor () {
        ...
        this.state = {data: [{id: 'test',}]};
        //The below value presumably would normally be passed into this file so that you would dynamically query the desired id
        this.query_id = 'xxxxxx';
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
```

#### Deploying locally

For development purposes, you might want to deploy the EDPUB API locally then
reference local values within the dashboard.  To do this, first be sure you have
docker, localstack, and terraform installed locally as well as a local copy of the
api repo in the directory above your local dashboard repo.

To deploy the EDPUB API locally, simply run the following command which will deploy
the EDPUB api locally and add some data to test the api calls.

```bash
npm run start-edpub-local-api
```

You should then source the .env file which will pull the local EDPUB API instance
rest api ID and store this as an environment variable which can be referenced within
the source code.

```bash
source .env
```

You can then serve the dashboard as normal using the following command:

```bash
APIROOT=http://localhost:5001 npm run serve
```

## Writing CSS

We follow a [Bem](http://getbem.com/naming/) naming format.

## Cross-repository Development

What to do when you need to make changes to Earthdata Pub core in order to implement
a dashboard need. For example, if you needed to update the Fake Authentication code
on the @earthdata-pub-api/api in order to test something on the dashboard. These
instructions can be extrapolated for other core packages.

The basic steps to follow are:

1. Link your local @earthdata-pub-api/api code so that it's visible to the dashboard.

    This is a two step process, where you use [`npm link`](https://docs.npmjs.com/cli-commands/link.html)
    to prepare the @earthdata-pub-api/api by running `npm link` in the `earthdata-pub-api/package`
    directoryand then use it in the dashboard project by running `npm link @earthdata-pub-api/api`
    in the dashboard root directory.

    When you have done this, you need to make sure that you only use the LocalStack/Elasticsearch
    portion of the docker-compose containers, e.g. run `npm run start-localstack`
    and `npm run serve-api` in order to run the linked version of the @earthdata-pub-api/api.
    Do all of your development locally including running unit and integration tests.
    When you are satisfied with the changes to the Earthdata Pub core code (and when
    that is merged) you can do an alpha release of the code by building an alpha
    release of the package `npm version prerelease --preid=alpha` and then publishing
    to npm with a tag of `alpha`. `npm publish --tag next`. This will upload the
    contents of your `earthdata-pub-api/package` to npm with a version that looks
    like `1.18.1-alpha.0` and a tag of `next`.

2. Update the dashboard to use the alpha package for CI.

    Update package.json to use the alpha version of the @earthdata-pub-api/api by
    installing it `npm install @earthdata-pub-api/api@1.0.1 --save-dev`  This will
    install the package from npm as well as allow circleCI to run all of the tests.

3. Clean up when core package is released.

    When Earthdata Pub core releases a new version, install it to the dashboard,
    make sure that tests still pass and then deprecate the alpha version that was
    published. `npm deprecate @earthdata-pub-api/api@1.0.1`, this will remove it
    from the current version history on npm. and
    `npm dist-tag rm @earthdata-pub-api/api@1.0.1 next` to remove the tag and prevent
    the alpha package from showing up under current tags.
