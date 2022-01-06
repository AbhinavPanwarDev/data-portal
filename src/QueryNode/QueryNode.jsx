import { useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { jsonToString, getSubmitPath } from '../utils';
import Popup from '../components/Popup';
import QueryForm from './QueryForm';
import './QueryNode.css';

/**
 * QueryNode shows the details of a particular node
 * @param {Object} props
 * @param {Object} props.submission
 * @param {Object} props.queryNodes
 * @param {Object} props.popups
 * @param {(value: any, cb?: Function) => void} props.onSearchFormSubmit
 * @param {(param: { view_popup?: boolean; nodedelete_popup?: boolean | string; }) => void} props.onUpdatePopup
 * @param {() => void} props.onClearDeleteSession
 * @param {(param: { project: string; id: string; }) => void} props.onDeleteNode
 * @param {(param: { project: string; id: string; }) => Promise<void>} props.onStoreNodeInfo
 */
function QueryNode({
  submission = null,
  queryNodes = null,
  popups = null,
  onSearchFormSubmit,
  onUpdatePopup,
  onClearDeleteSession,
  onDeleteNode,
  onStoreNodeInfo,
}) {
  const { project } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (Array.from(searchParams.keys()).length > 0)
      // Linking directly to a search result,
      // so kick-off search here (rather than on button click)
      onSearchFormSubmit({
        project,
        ...Object.fromEntries(searchParams.entries()),
      });
  }, []);

  /**
   * Internal helper to render the 'view node" popup if necessary
   * based on the popups and queryNodes properties attached to this component.
   * @return {{ state: 'viewNode' | 'noPopup'; popupEl: JSX.Element | null; }}
   * state (just used for testing) is string one of [viewNode, noPopup], and
   * popupEl is either null or a <Popup> properly configured to render
   */
  function renderViewPopup() {
    function closeViewPopup() {
      onUpdatePopup({ view_popup: false });
    }

    if (popups?.view_popup && queryNodes.query_node)
      // View node button clicked
      return {
        state: 'viewNode',
        popupEl: (
          <Popup
            title={queryNodes.query_node.submitter_id}
            lines={[{ code: jsonToString(queryNodes.query_node) }]}
            onClose={closeViewPopup}
            rightButtons={[
              {
                caption: 'Close',
                fn: closeViewPopup,
              },
            ]}
          />
        ),
      };
    return {
      state: 'noPopup',
      popupEl: null,
    };
  }

  /**
   * Internal helper to render the "delete node" popup if necessary
   * based on the popups and queryNodes properties attached to this component.
   * @return {{ state: 'confirmDelete' | 'waitForDelete' | 'deleteFailed' | 'noPopup'; popupEl: JSX.Element | null; }}
   * state (just used for testing) is string one of [confirmDelete, waitForDelete, deleteFailed, noPopup], and
   * popupEl is either null or a <Popup> properly configured to render
   */
  function renderDeletePopup() {
    function closeDelete() {
      onClearDeleteSession();
      onUpdatePopup({ nodedelete_popup: false });
    }
    if (popups?.nodedelete_popup)
      // User clicked on node 'Delete' button
      return {
        state: 'confirmDelete',
        popupEl: (
          <Popup
            title={queryNodes.query_node.submitter_id}
            message={'Are you sure you want to delete this node?'}
            error={jsonToString(queryNodes.delete_error)}
            lines={[{ code: jsonToString(queryNodes.query_node) }]}
            leftButtons={[
              {
                caption: 'Cancel',
                fn: closeDelete,
              },
            ]}
            rightButtons={[
              {
                caption: 'Confirm',
                fn: () => {
                  onDeleteNode({
                    project,
                    id: queryNodes.stored_node_info,
                  });
                  onUpdatePopup({
                    nodedelete_popup: 'Waiting for delete to finish ...',
                  });
                },
              },
            ]}
            onClose={closeDelete}
          />
        ),
      };
    if (queryNodes?.query_node && queryNodes?.delete_error)
      // Error deleting node
      return {
        state: 'deleteFailed',
        popupEl: (
          <Popup
            title={queryNodes.query_node.submitter_id}
            message={`Error deleting: ${queryNodes.query_node.submitter_id}`}
            error={jsonToString(queryNodes.delete_error)}
            lines={[{ code: jsonToString(queryNodes.query_node) }]}
            onClose={closeDelete}
          />
        ),
      };
    if (typeof popups?.nodedelete_popup === 'string' && queryNodes?.query_node)
      // Waiting for node delete to finish
      return {
        state: 'waitForDelete',
        popupEl: (
          <Popup
            title={queryNodes.query_node.submitter_id}
            message={popups.nodedelete_popup}
            onClose={() => onUpdatePopup({ nodedelete_popup: false })}
          />
        ),
      };
    return {
      state: 'noPopup',
      popupEl: null,
    };
  }

  const queryNodesList =
    queryNodes.search_status === 'succeed: 200'
      ? Object.entries(queryNodes.search_result.data)
      : [];

  return (
    <div>
      <h3>
        browse <Link to={`/${project}`}>{project}</Link>{' '}
      </h3>
      {renderViewPopup().popupEl}
      {renderDeletePopup().popupEl}
      <QueryForm
        onSearchFormSubmit={(data, newSearchParams) =>
          onSearchFormSubmit(data, () => setSearchParams(newSearchParams))
        }
        project={project}
        nodeTypes={submission.nodeTypes}
        queryNodeCount={queryNodesList.length}
      />
      <h4>most recent 20:</h4>
      {queryNodesList.map(([key, value]) => (
        <ul key={key}>
          {value.map(({ id, submitter_id: submitterId }) => (
            <li key={submitterId}>
              <span>{submitterId}</span>
              <a
                className='query-node__button query-node__button--download'
                href={`${getSubmitPath(project)}/export?format=json&ids=${id}`}
              >
                Download
              </a>
              <button
                className='query-node__button query-node__button--view'
                onClick={() =>
                  onStoreNodeInfo({ project, id }).then(() =>
                    onUpdatePopup({ view_popup: true })
                  )
                }
                type='button'
              >
                View
              </button>
              <button
                className='query-node__button query-node__button--delete'
                onClick={() =>
                  onStoreNodeInfo({ project, id }).then(() =>
                    onUpdatePopup({ nodedelete_popup: true })
                  )
                }
                type='button'
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}

QueryNode.propTypes = {
  submission: PropTypes.object,
  queryNodes: PropTypes.object,
  popups: PropTypes.object,
  onSearchFormSubmit: PropTypes.func.isRequired,
  onUpdatePopup: PropTypes.func.isRequired,
  onClearDeleteSession: PropTypes.func.isRequired,
  onDeleteNode: PropTypes.func.isRequired,
  onStoreNodeInfo: PropTypes.func.isRequired,
};

export default QueryNode;
