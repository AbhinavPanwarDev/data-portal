import { useRef } from 'react';
import PropTypes from 'prop-types';
import './SimpleInputField.css';

/**
 * @typedef {Object} SimpleInputFieldProps
 * @property {?{ isError: boolean; message: string }} [error]
 * @property {JSX.Element} input
 * @property {string | JSX.Element} label
 */

/** @param {SimpleInputFieldProps} props */
function SimpleInputField({ error, input, label }) {
  const inputEl = useRef(input);
  const inputId =
    // id for native input elements, inputId for react-select
    inputEl.current?.props?.id ?? inputEl.current?.props?.inputId ?? undefined;

  return (
    <div className='simple-input-field__container'>
      <label className='simple-input-field__label' htmlFor={inputId}>
        {label}
      </label>
      <div
        className={`simple-input-field__input${
          error && error.isError ? ' simple-input-field__input--error' : ''
        }`}
      >
        {input}
      </div>
      {error && error.isError && (
        <div className='simple-input-field__error-message'>{error.message}</div>
      )}
    </div>
  );
}

SimpleInputField.propTypes = {
  error: PropTypes.shape({
    isError: PropTypes.bool,
    message: PropTypes.string,
  }),
  input: PropTypes.object.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
};

export default SimpleInputField;
