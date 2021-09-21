/* eslint-disable react/prop-types */
import React, { Suspense } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Spinner from './gen3-ui-component/components/Spinner/Spinner';

import Layout from './Layout';
import ReduxLogin, { fetchLogin } from './Login/ReduxLogin';
import ProtectedContent from './Login/ProtectedContent';
// import { fetchCoreMetadata } from './CoreMetadata/reduxer';
import { fetchAccess } from './UserProfile/ReduxUserProfile';
import { submitSearchForm } from './QueryNode/ReduxQueryNode';
import {
  basename,
  dev,
  enableResourceBrowser,
  gaDebug,
  // workspaceUrl,
  // workspaceErrorUrl,
} from './localconf';
import { gaTracking } from './params';
import GA, { RouteTracker } from './components/GoogleAnalytics';
import isEnabled from './helpers/featureFlags';

// lazy-loaded pages
const DataDictionary = React.lazy(() => import('./DataDictionary'));
const GraphQLQuery = React.lazy(() => import('./GraphQLEditor/ReduxGqlEditor'));
const GuppyDataExplorer = React.lazy(() => import('./GuppyDataExplorer'));
const GuppySubject = React.lazy(() => import('./GuppySubject'));
const IndexPage = React.lazy(() => import('./Index/page'));
const ProjectSubmission = React.lazy(() =>
  import('./Submission/ReduxProjectSubmission')
);
const ReduxMapDataModel = React.lazy(() =>
  import('./Submission/ReduxMapDataModel')
);
const ReduxMapFiles = React.lazy(() => import('./Submission/ReduxMapFiles'));
const ReduxQueryNode = React.lazy(() => import('./QueryNode/ReduxQueryNode'));
const SubmissionPage = React.lazy(() => import('./Submission/page'));
const ResourceBrowser = React.lazy(() => import('./ResourceBrowser'));
const UserProfile = React.lazy(() => import('./UserProfile/ReduxUserProfile'));
// const CoreMetadataPage = React.lazy(() => import('./CoreMetadata/page'));
// const ErrorWorkspacePlaceholder = React.lazy(() =>
//   import('./Workspace/ErrorWorkspacePlaceholder')
// );
// const Indexing = React.lazy(() => import('./Indexing/Indexing'));
// const Workspace = React.lazy(() => import('./Workspace'));

function App({ store }) {
  return (
    <Provider store={store}>
      <BrowserRouter basename={basename}>
        {GA.init(gaTracking, dev, gaDebug) && <RouteTracker />}
        {isEnabled('noIndex') && (
          <Helmet>
            <meta name='robots' content='noindex,nofollow' />
          </Helmet>
        )}
        <Layout>
          <Suspense
            fallback={
              <div style={{ height: '100vh' }}>
                <Spinner />
              </div>
            }
          >
            <Switch>
              <Route path='/login'>
                <ProtectedContent
                  isPublic
                  filter={() => store.dispatch(fetchLogin())}
                >
                  <ReduxLogin />
                </ProtectedContent>
              </Route>
              <Route exact path='/'>
                <ProtectedContent>
                  <IndexPage />
                </ProtectedContent>
              </Route>
              <Route exact path='/submission'>
                <ProtectedContent isAdminOnly>
                  <SubmissionPage />
                </ProtectedContent>
              </Route>
              <Route
                exact
                path='/submission/files'
                component={({ history }) => (
                  <ProtectedContent isAdminOnly>
                    <ReduxMapFiles history={history} />
                  </ProtectedContent>
                )}
              />
              <Route
                exact
                path='/submission/map'
                component={({ history }) => (
                  <ProtectedContent isAdminOnly>
                    <ReduxMapDataModel history={history} />
                  </ProtectedContent>
                )}
              />
              <Route path='/query'>
                <ProtectedContent>
                  <GraphQLQuery />
                </ProtectedContent>
              </Route>
              <Route path='/identity'>
                <ProtectedContent filter={() => store.dispatch(fetchAccess())}>
                  <UserProfile />
                </ProtectedContent>
              </Route>
              <Route path='/dd/:node'>
                <ProtectedContent>
                  <DataDictionary />
                </ProtectedContent>
              </Route>
              <Route path='/dd'>
                <ProtectedContent>
                  <DataDictionary />
                </ProtectedContent>
              </Route>
              <Route
                path='/:project/search'
                component={({ location, match }) => {
                  const queryFilter = () => {
                    const searchParams = new URLSearchParams(location.search);

                    return Array.from(searchParams.keys()).length > 0
                      ? // Linking directly to a search result,
                        // so kick-off search here (rather than on button click)
                        store.dispatch(
                          submitSearchForm({
                            project: match.params.project,
                            ...Object.fromEntries(searchParams.entries()),
                          })
                        )
                      : Promise.resolve('ok');
                  };
                  return (
                    <ProtectedContent filter={queryFilter}>
                      <ReduxQueryNode />
                    </ProtectedContent>
                  );
                }}
              />
              <Route path='/explorer'>
                <ProtectedContent>
                  <GuppyDataExplorer />
                </ProtectedContent>
              </Route>
              <Route path='/subjects/:id'>
                <ProtectedContent>
                  <GuppySubject />
                </ProtectedContent>
              </Route>
              {enableResourceBrowser && (
                <Route path='/resource-browser'>
                  <ProtectedContent>
                    <ResourceBrowser />
                  </ProtectedContent>
                </Route>
              )}
              <Route path='/:project'>
                <ProtectedContent>
                  <ProjectSubmission />
                </ProtectedContent>
              </Route>
              {/* <Route path='/indexing'>
                <ProtectedContent>
                  <Indexing />
                </ProtectedContent>
              </Route>
              <Route
                exact
                path='/files/*'
                component={({ match }) => (
                  <ProtectedContent
                    filter={() =>
                      store.dispatch(fetchCoreMetadata(props.match.params[0]))
                    }
                  >
                    <CoreMetadataPage />
                  </ProtectedContent>
                )}
              />
              <Route path='/files'>
                <ProtectedContent>
                  <GuppyDataExplorer />
                </ProtectedContent>
              </Route>
              <Route path='/workspace'>
                <ProtectedContent>
                  <Workspace />
                </ProtectedContent>
              </Route>
              <Route
                path={workspaceUrl}
                component={ErrorWorkspacePlaceholder}
              />
              <Route
                path={workspaceErrorUrl}
                component={ErrorWorkspacePlaceholder}
              /> */}
            </Switch>
          </Suspense>
        </Layout>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
