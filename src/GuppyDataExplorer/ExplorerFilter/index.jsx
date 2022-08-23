import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import ConnectedFilter from '../../GuppyComponents/ConnectedFilter';
import { updatePatientIds } from '../../redux/explorer/slice';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import './ExplorerFilter.css';

/** @typedef {import('../../redux/types').RootState} RootState */
/** @typedef {import('../types').GuppyData} GuppyData */

/** @param {{ className: string }} props */
export function DisabledExplorerFilter({ className }) {
  return (
    <div className={className}>
      <div className='explorer-filter__title-container'>
        <h4 className='explorer-filter__title'>Filters</h4>
      </div>
      <p style={{ marginBottom: '1rem' }}>
        <FontAwesomeIcon
          className='screen-size-warning__icon'
          icon='triangle-exclamation'
          color='var(--pcdc-color__secondary)'
        />
        <em>Composed filter state cannot be modified!</em>
      </p>
      <p>
        Use Filter Set Workspace to build new filter sets or load saved ones
        with composed filter states.
      </p>
    </div>
  );
}

DisabledExplorerFilter.propTypes = {
  className: PropTypes.string,
};

/**
 * @typedef {Object} ExplorerFilterProps
 * @property {string} [anchorValue]
 * @property {string} [className]
 * @property {GuppyData['initialTabsOptions']} [initialTabsOptions]
 * @property {GuppyData['filter']} filter
 * @property {GuppyData['onFilterChange']} onFilterChange
 * @property {GuppyData['onAnchorValueChange']} onAnchorValueChange
 * @property {GuppyData['tabsOptions']} tabsOptions
 */

/** @param {ExplorerFilterProps} props */
function ExplorerFilter({ className = '', ...filterProps }) {
  const dispatch = useAppDispatch();
  /** @param {RootState['explorer']['patientIds']} ids */
  function handlePatientIdsChange(ids) {
    dispatch(updatePatientIds(ids));
  }
  const {
    config: { adminAppliedPreFilters, filterConfig, guppyConfig },
    patientIds,
  } = useAppSelector((state) => state.explorer);

  const connectedFilterProps = {
    ...filterProps,
    adminAppliedPreFilters,
    filterConfig,
    guppyConfig,
    patientIds,
    onPatientIdsChange: handlePatientIdsChange,
  };
  const hasExplorerFilter =
    Object.keys(filterProps.filter.value ?? {}).length > 0;
  const filterCombineMode = filterProps.filter.__combineMode ?? 'AND';
  function updateFilterCombineMode(e) {
    filterProps.onFilterChange({
      ...filterProps.filter,
      __combineMode: e.target.value,
    });
  }

  return (
    <div className={className}>
      <div className='explorer-filter__title-container'>
        <h4 className='explorer-filter__title'>Filters</h4>
        {hasExplorerFilter && (
          <button
            type='button'
            className='explorer-filter__unselect-button'
            onClick={() => filterProps.onFilterChange(undefined)}
          >
            Unselect all
          </button>
        )}
      </div>
      <div className='explorer-filter__combine-mode'>
        Combine filters with
        {['AND', 'OR'].map((/** @type {'AND' | 'OR'} */ combineMode) => (
          <label
            key={combineMode}
            className={filterCombineMode === combineMode ? 'active' : undefined}
          >
            <input
              name='combineMode'
              value={combineMode}
              type='radio'
              onChange={updateFilterCombineMode}
              checked={filterCombineMode === combineMode}
            />
            {combineMode}
          </label>
        ))}
      </div>
      <ConnectedFilter {...connectedFilterProps} />
    </div>
  );
}

ExplorerFilter.propTypes = {
  anchorValue: PropTypes.string, // from GuppyWrapper
  className: PropTypes.string,
  filter: PropTypes.object.isRequired, // from GuppyWrapper
  initialTabsOptions: PropTypes.object, // from GuppyWrapper
  onAnchorValueChange: PropTypes.func.isRequired, // from GuppyWrapper
  onFilterChange: PropTypes.func.isRequired, // from GuppyWrapper
  tabsOptions: PropTypes.object.isRequired, // from GuppWrapper
};

export default ExplorerFilter;
