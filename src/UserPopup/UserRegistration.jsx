import { useState } from 'react';
import PropTypes from 'prop-types';
import SimplePopup from '../components/SimplePopup';
import { headers, userapiPath } from '../localconf';
import RegistrationForm from './RegistrationForm';
import './UserRegistration.css';

/** @typedef {import('../types').User} User */
/** @typedef {import('./types').UserRegistrationDocument} UserRegistrationDocument */
/** @typedef {import('./types').UserRegistrationInput} UserRegistrationInput */

/**
 * @param {Object} prop
 * @param {UserRegistrationDocument[]} prop.docsToBeReviewed
 * @param {boolean} prop.shouldRegister
 * @param {(user: User) => ('success')} prop.updateAccess
 */
function UserRegistration({ docsToBeReviewed, shouldRegister, updateAccess }) {
  const [show, setShow] = useState(shouldRegister);

  function handleClose() {
    setShow(false);
  }

  async function handleRegister(
    /** @type {UserRegistrationInput} */ userInput
  ) {
    const { reviewStatus, ...userInformation } = userInput;

    try {
      const userResponse = await fetch(`${userapiPath}user/`, {
        body: JSON.stringify(userInformation),
        credentials: 'include',
        headers,
        method: 'PUT',
      });
      if (!userResponse.ok)
        throw new Error('Failed to update user information.');

      const hasReviewedDocument =
        Object.values(reviewStatus).filter(Boolean).length > 0;
      const documentsResponse = hasReviewedDocument
        ? await fetch(`${userapiPath}user/documents`, {
            body: JSON.stringify(reviewStatus),
            credentials: 'include',
            headers,
            method: 'POST',
          })
        : new Response();
      if (!documentsResponse.ok)
        throw new Error('Failed to update document review status.');

      /** @type {User} */
      const user = await userResponse.json();
      return updateAccess(user);
    } catch (e) {
      console.error(e); // eslint-disable-line no-console
      return 'error';
    }
  }

  function handleSubscribe() {
    window.open('http://sam.am/PCDCnews', '_blank');
  }

  return (
    show && (
      <SimplePopup>
        <RegistrationForm
          docsToBeReviewed={docsToBeReviewed}
          onClose={handleClose}
          onRegister={handleRegister}
          onSubscribe={handleSubscribe}
        />
      </SimplePopup>
    )
  );
}

UserRegistration.propTypes = {
  docsToBeReviewed: PropTypes.array.isRequired,
  shouldRegister: PropTypes.bool.isRequired,
  updateAccess: PropTypes.func.isRequired,
};

export default UserRegistration;
