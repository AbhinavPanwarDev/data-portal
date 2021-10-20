import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../gen3-ui-component/components/Button';
import './ExplorerRequestAccessButton.css';

/**
 * @typedef {Object} ExplorerRequestAccessButtonProps
 * @property {string} getAccessButtonLink
 * @property {string} tooltipText
 */

/** @param {ExplorerRequestAccessButtonProps} props */
function ExplorerRequestAccessButton({ getAccessButtonLink, tooltipText }) {
  return (
    <Button
      className='explorer-request-access__button'
      buttonType='secondary'
      enabled={!!getAccessButtonLink}
      label='Request Access'
      onClick={() => {
        if (getAccessButtonLink !== undefined) window.open(getAccessButtonLink);
      }}
      rightIcon='key'
      tooltipEnabled={!!tooltipText}
      tooltipText={tooltipText}
    />
  );
}

ExplorerRequestAccessButton.propTypes = {
  getAccessButtonLink: PropTypes.string,
  tooltipText: PropTypes.string,
};

export default ExplorerRequestAccessButton;
