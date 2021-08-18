/* eslint react/forbid-prop-types: 0 */
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import FilterGroup from '../../gen3-ui-component/components/filters/FilterGroup';
import FilterList from '../../gen3-ui-component/components/filters/FilterList';
import { queryGuppyForStatus } from '../Utils/queries';
import {
  getFilterSections,
  updateCountsInInitialTabsOptions,
  sortTabsOptions,
  unnestAggsData,
} from '../Utils/filters';
import '../typedef';

/**
 * @typedef {Object} ConnectedFilterProps
 * @property {{ [x: string]: OptionFilter }} [adminAppliedPreFilters]
 * @property {AnchorConfig} anchorConfig
 * @property {string} className
 * @property {FilterState} filter
 * @property {FilterConfig} filterConfig
 * @property {GuppyConfig} guppyConfig
 * @property {boolean} [hidden]
 * @property {boolean} [hideZero]
 * @property {FilterState} [initialAppliedFilters]
 * @property {SimpleAggsData} initialTabsOptions
 * @property {(x: FilterState) => void} onFilterChange
 * @property {(x: string[]) => void} [onPatientIdsChange]
 * @property {string[]} [patientIds]
 * @property {AggsData} receivedAggsData
 * @property {number} [tierAccessLimit]
 */

/** @param {ConnectedFilterProps} props */
function ConnectedFilter({
  adminAppliedPreFilters = {},
  anchorConfig,
  className = '',
  filter,
  filterConfig,
  guppyConfig,
  hidden = false,
  hideZero = false,
  initialAppliedFilters = {},
  initialTabsOptions = {},
  onFilterChange,
  onPatientIdsChange,
  patientIds,
  receivedAggsData,
  tierAccessLimit,
}) {
  if (
    hidden ||
    filterConfig.tabs === undefined ||
    filterConfig.tabs.length === 0
  )
    return null;

  const tabsOptions = unnestAggsData(receivedAggsData);
  const processedTabsOptions = sortTabsOptions(
    updateCountsInInitialTabsOptions(initialTabsOptions, tabsOptions, filter)
  );
  if (Object.keys(processedTabsOptions).length === 0) {
    return null;
  }

  const arrayFields = useRef([]);
  useEffect(() => {
    queryGuppyForStatus(guppyConfig.path).then((res) => {
      for (const { fields } of Object.values(res.indices))
        if (fields?.length > 0) arrayFields.current.concat(fields);
    });
  }, []);

  const filterTabs = filterConfig.tabs.map(
    ({ fields, searchFields }, index) => (
      <FilterList
        key={index}
        sections={getFilterSections(
          fields,
          searchFields,
          guppyConfig.fieldMapping,
          processedTabsOptions,
          initialTabsOptions,
          adminAppliedPreFilters,
          guppyConfig,
          arrayFields.current
        )}
        tierAccessLimit={tierAccessLimit}
        lockedTooltipMessage={`You may only view summary information for this project. You do not have ${guppyConfig.dataType}-level access.`}
        disabledTooltipMessage={`This resource is currently disabled because you are exploring restricted data. When exploring restricted data you are limited to exploring cohorts of ${tierAccessLimit} ${
          guppyConfig.nodeCountTitle?.toLowerCase() || guppyConfig.dataType
        } or more.`}
        arrayFields={arrayFields.current}
      />
    )
  );

  return (
    <FilterGroup
      anchorConfig={anchorConfig}
      className={className}
      tabs={filterTabs}
      filterConfig={filterConfig}
      onFilterChange={onFilterChange}
      onPatientIdsChange={onPatientIdsChange}
      patientIds={patientIds}
      hideZero={hideZero}
      initialAppliedFilters={initialAppliedFilters}
    />
  );
}

ConnectedFilter.propTypes = {
  adminAppliedPreFilters: PropTypes.object,
  anchorConfig: PropTypes.shape({
    fieldName: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.string),
    tabs: PropTypes.arrayOf(PropTypes.string),
  }),
  className: PropTypes.string,
  filter: PropTypes.object.isRequired,
  filterConfig: PropTypes.shape({
    tabs: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        fields: PropTypes.arrayOf(PropTypes.string),
        searchFields: PropTypes.arrayOf(PropTypes.string),
      })
    ),
  }).isRequired,
  guppyConfig: PropTypes.shape({
    path: PropTypes.string.isRequired,
    dataType: PropTypes.string.isRequired,
    fieldMapping: PropTypes.arrayOf(
      PropTypes.shape({
        field: PropTypes.string,
        name: PropTypes.string,
      })
    ),
    nodeCountTitle: PropTypes.string,
  }).isRequired,
  hidden: PropTypes.bool,
  hideZero: PropTypes.bool,
  initialAppliedFilters: PropTypes.object,
  initialTabsOptions: PropTypes.object,
  onFilterChange: PropTypes.func.isRequired,
  onPatientIdsChange: PropTypes.func,
  patientIds: PropTypes.arrayOf(PropTypes.string),
  receivedAggsData: PropTypes.object.isRequired,
  tierAccessLimit: PropTypes.number,
};

export default ConnectedFilter;
