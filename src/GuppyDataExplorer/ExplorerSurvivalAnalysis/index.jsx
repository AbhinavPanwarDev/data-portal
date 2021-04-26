import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import cloneDeep from 'lodash.clonedeep';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { getGQLFilter } from '../../GuppyComponents/Utils/queries';
import { enumFilterList } from '../../params';
import Spinner from '../../components/Spinner';
import SurvivalPlot from './SurvivalPlot';
import ControlForm from './ControlForm';
import RiskTable from './RiskTable';
import {
  filterRisktableByTime,
  filterSurvivalByTime,
  getFactors,
} from './utils';
import { fetchWithCreds } from '../../actions';
import './ExplorerSurvivalAnalysis.css';
import './typedef';

let controller = new AbortController();
const fetchResult = (body) => {
  controller.abort();
  controller = new AbortController();
  return fetchWithCreds({
    path: '/analysis/tools/survival',
    method: 'POST',
    body: JSON.stringify(body),
    signal: controller.signal,
  }).then(({ response, data, status }) => {
    if (status !== 200) throw response.statusText;
    return data;
  });
};

/**
 * @param {Object} prop
 * @param {Object} prop.aggsData
 * @param {Array} prop.fieldMapping
 * @param {Object} prop.filter
 */
function ExplorerSurvivalAnalysis({ aggsData, fieldMapping, filter }) {
  const [pval, setPval] = useState(-1); // -1 is a placeholder for no p-value
  const [risktable, setRisktable] = useState([]);
  const [survival, setSurvival] = useState([]);
  const [isStratified, setIsStratified] = useState(true);
  const [timeInterval, setTimeInterval] = useState(2);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(20);

  const [transformedFilter, setTransformedFilter] = useState(
    getGQLFilter(filter)
  );
  const [isFilterChanged, setIsFilterChanged] = useState(false);
  useEffect(() => {
    const updatedFilter = getGQLFilter(cloneDeep(filter));
    if (JSON.stringify(updatedFilter) !== JSON.stringify(transformedFilter)) {
      setTransformedFilter(updatedFilter);
      setIsFilterChanged(true);
    }
  }, [filter]);

  const [factors, setFactors] = useState(
    getFactors(aggsData, fieldMapping, enumFilterList)
  );
  useEffect(() => {
    setFactors(getFactors(aggsData, fieldMapping, enumFilterList));
  }, [aggsData, fieldMapping]);

  /** @type {ColorScheme} */
  const initColorScheme = { All: schemeCategory10[0] };
  const [colorScheme, setColorScheme] = useState(initColorScheme);
  const getNewColorScheme = (/** @type {SurvivalData[]} */ survival) => {
    if (survival.length === 1) return initColorScheme;

    /** @type {ColorScheme} */
    const newScheme = {};
    let factorValueCount = 0;
    for (const { name } of survival) {
      const factorValue = name.split(',')[0].split('=')[1];
      if (!newScheme.hasOwnProperty(factorValue)) {
        newScheme[factorValue] = schemeCategory10[factorValueCount % 9];
        factorValueCount++;
      }
    }
    return newScheme;
  };

  const [isUpdating, setIsUpdating] = useState(false);
  const [isError, setIsError] = useState(false);
  /** @type {UserInputSubmitHandler} */
  const handleSubmit = ({
    timeInterval,
    startTime,
    endTime,
    shouldUpdateResults,
    ...requestParameter
  }) => {
    if (isError) setIsError(false);
    if (isFilterChanged) setIsFilterChanged(false);
    setIsUpdating(true);
    setIsStratified(requestParameter.stratificationVariable !== '');
    setTimeInterval(timeInterval);
    setStartTime(startTime);
    setEndTime(endTime);

    if (shouldUpdateResults)
      fetchResult({
        filter: transformedFilter,
        parameter: requestParameter,
        result: { pval: true, risktable: true, survival: true },
      })
        .then((result) => {
          setPval(result.pval ? +parseFloat(result.pval).toFixed(4) : -1);
          setRisktable(result.risktable);
          setSurvival(result.survival);
          setColorScheme(getNewColorScheme(result.survival));
          setIsUpdating(false);
        })
        .catch((e) => {
          if (e.name !== 'AbortError') {
            setIsError(true);
            setIsUpdating(false);
          }
        });
    else setIsUpdating(false);
  };
  useEffect(() => {
    let isMounted = true;

    if (isMounted) {
      setIsError(false);
      setIsUpdating(true);
      fetchResult({
        filter: transformedFilter,
        parameter: {
          factorVariable: '',
          stratificationVariable: '',
          efsFlag: false,
        },
        result: { pval: true, risktable: true, survival: true },
      })
        .then((result) => {
          if (isMounted) {
            setPval(result.pval ? +parseFloat(result.pval).toFixed(4) : -1);
            setRisktable(result.risktable);
            setSurvival(result.survival);
          }
        })
        .catch((e) => isMounted && setIsError(true))
        .finally(() => isMounted && setIsUpdating(false));
    }

    return () => (isMounted = false);
  }, []);

  return (
    <div className='explorer-survival-analysis'>
      <div className='explorer-survival-analysis__column-left'>
        <ControlForm
          factors={factors}
          onSubmit={handleSubmit}
          timeInterval={timeInterval}
          isError={isError}
          isFilterChanged={isFilterChanged}
        />
      </div>
      <div className='explorer-survival-analysis__column-right'>
        {isUpdating ? (
          <Spinner />
        ) : isError ? (
          <div className='explorer-survival-analysis__error'>
            <h1>Error obtaining survival analysis result...</h1>
            <p>
              Please retry by clicking "Apply" button or refreshing the page. If
              the problem persists, please contact administrator for more
              information.
            </p>
          </div>
        ) : (
          <>
            <div className='explorer-survival-analysis__pval'>
              {pval >= 0 && `Log-rank test p-value: ${pval}`}
            </div>
            <SurvivalPlot
              colorScheme={colorScheme}
              data={filterSurvivalByTime(survival, startTime, endTime)}
              isStratified={isStratified}
              timeInterval={timeInterval}
            />
            <RiskTable
              data={filterRisktableByTime(risktable, startTime, endTime)}
              notStratified={!isStratified}
              timeInterval={timeInterval}
            />
          </>
        )}
      </div>
    </div>
  );
}

ExplorerSurvivalAnalysis.propTypes = {
  aggsData: PropTypes.object,
  fieldMapping: PropTypes.array,
  filter: PropTypes.object,
};

ExplorerSurvivalAnalysis.defaultProps = {
  fieldMapping: [],
};

export default React.memo(ExplorerSurvivalAnalysis);
