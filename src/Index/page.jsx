import React from 'react';
import PropTypes from 'prop-types';
import MediaQuery from 'react-responsive';
import {
  ReduxIndexButtonBar,
  ReduxIndexBarChart,
  ReduxIndexCounts,
  ReduxIntroduction,
} from './reduxer';
import { getIndexPageChartData } from './relayer';
import dictIcons from '../img/icons';
import { components } from '../params';
import { breakpoints } from '../localconf';
import './page.less';

class IndexPage extends React.Component {
  componentDidMount() {
    getIndexPageChartData();
  }

  render() {
    return (
      <div className='index-page'>
        <div className='index-page__top'>
          <div className='index-page__introduction'>
            <ReduxIntroduction
              data={components.index.introduction}
              dictIcons={dictIcons}
            />
            <MediaQuery query={`(max-width: ${breakpoints.tablet}px)`}>
              <ReduxIndexCounts />
            </MediaQuery>
          </div>
          <div className='index-page__bar-chart'>
            <MediaQuery query={`(min-width: ${breakpoints.tablet + 1}px)`}>
              <ReduxIndexBarChart />
            </MediaQuery>
          </div>
        </div>
        <ReduxIndexButtonBar {...this.props} />
      </div>
    );
  }
}

IndexPage.propTypes = {
  history: PropTypes.object.isRequired,
};

export default IndexPage;
