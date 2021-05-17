import React, { useEffect, useState } from 'react';
import cloneDeep from 'lodash.clonedeep';
import Tooltip from 'rc-tooltip';
import 'rc-tooltip/assets/bootstrap_white.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SimplePopup from '../../components/SimplePopup';
import Button from '../../gen3-ui-component/components/Button';
import { CohortActionMenu, CohortActionForm } from './CohortActionComponents';
import {
  createEmptyCohort,
  truncateWithEllipsis,
  fetchCohorts,
  saveCohort,
  updateCohort,
  deleteCohort,
} from './utils';
import './ExplorerCohort.css';
import './typedef';

/**
 * @param {Object} prop
 * @param {string} prop.className
 * @param {ExplorerFilters} prop.filter
 * @param {({ filters }: { filters: ExplorerFilters }) => void} prop.onOpenCohort
 * @param {({ filters }: { filters: ExplorerFilters }) => void} prop.onDeleteCohort
 */
function ExplorerCohort({ className, filter, onOpenCohort, onDeleteCohort }) {
  const [cohort, setCohort] = useState(createEmptyCohort());

  /** @type {ExplorerCohort[]} */
  const emptyCohorts = [];
  const [cohorts, setCohorts] = useState(emptyCohorts);
  const [isError, setIsError] = useState(false);
  useEffect(() => {
    let isMounted = true;
    if (!isError)
      fetchCohorts()
        .then((cohorts) => isMounted && setCohorts(cohorts))
        .catch(() => setIsError(true));

    return () => (isMounted = false);
  }, [isError]);

  /** @type {[ExplorerCohortActionType, React.Dispatch<React.SetStateAction<ExplorerCohortActionType>>]} */
  const [actionType, setActionType] = useState('open');
  const [showActionForm, setShowActionForm] = useState(false);
  function openActionForm(actionType) {
    setActionType(actionType);
    setShowActionForm(true);
  }
  function closeActionForm() {
    setShowActionForm(false);
  }

  function handleOpen(/** @type {ExplorerCohort} */ opened) {
    setCohort(cloneDeep(opened));
    onOpenCohort(cloneDeep(opened));
    closeActionForm();
  }
  async function handleSave(/** @type {ExplorerCohort} */ saved) {
    try {
      setCohort(await saveCohort(saved));
      setCohorts(await fetchCohorts());
    } catch (e) {
      setIsError(true);
    } finally {
      closeActionForm();
    }
  }
  async function handleUpdate(/** @type {ExplorerCohort} */ updated) {
    try {
      await updateCohort(updated);
      setCohort(cloneDeep(updated));
      setCohorts(await fetchCohorts());
    } catch (e) {
      setIsError(true);
    } finally {
      closeActionForm();
    }
  }
  async function handleDelete(/** @type {ExplorerCohort} */ deleted) {
    try {
      await deleteCohort(deleted);
      setCohort(createEmptyCohort());
      setCohorts(await fetchCohorts());
      onDeleteCohort(createEmptyCohort());
    } catch (e) {
      setIsError(true);
    } finally {
      closeActionForm();
    }
  }

  const isFiltersChanged =
    JSON.stringify(filter) !== JSON.stringify(cohort.filters);
  function FilterChangedWarning() {
    return (
      <Tooltip
        placement='top'
        overlay='You have changed filters for this Cohort. Click this icon to undo.'
        arrowContent={<div className='rc-tooltip-arrow-inner' />}
      >
        <FontAwesomeIcon
          icon='exclamation-triangle'
          color='var(--pcdc-color__secondary)'
          size='xs'
          style={{
            cursor: 'pointer',
          }}
          onClick={() => onOpenCohort(cloneDeep(cohort))}
        />
      </Tooltip>
    );
  }

  return (
    <div className={className}>
      {isError ? (
        <div className='guppy-explorer-cohort__error'>
          <h2>Error obtaining saved cohorts data...</h2>
          <p>
            Please retry by clicking "Retry" button or refreshing the page.
            <br />
            If the problem persists, please contact administrator for more
            information.
          </p>
          <Button label='Retry' onClick={() => setIsError(false)} />
        </div>
      ) : (
        <>
          <div>
            <h1 className='guppy-explorer-cohort__name'>
              Cohort:{' '}
              {cohort.name ? (
                <>
                  {truncateWithEllipsis(cohort.name, 30)}{' '}
                  {isFiltersChanged && <FilterChangedWarning />}
                </>
              ) : (
                <span className='guppy-explorer-cohort__placeholder'>
                  untitled
                </span>
              )}
            </h1>
            <p>
              {cohort.description ? (
                truncateWithEllipsis(cohort.description, 80)
              ) : (
                <span className='guppy-explorer-cohort__placeholder'>
                  No description
                </span>
              )}
            </p>
          </div>
          <CohortActionMenu
            isCohortEmpty={cohort.name === ''}
            onSelectAction={(e) => openActionForm(e.value)}
          />
        </>
      )}
      {showActionForm && (
        <SimplePopup>
          <CohortActionForm
            actionType={actionType}
            currentCohort={cohort}
            currentFilters={filter}
            cohorts={cohorts}
            handlers={{
              handleOpen,
              handleSave,
              handleUpdate,
              handleDelete,
              handleClose: closeActionForm,
            }}
            isFiltersChanged={isFiltersChanged}
          />
        </SimplePopup>
      )}
    </div>
  );
}

export default ExplorerCohort;
