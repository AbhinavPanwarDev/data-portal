import PropTypes from 'prop-types';
import FileSaver from 'file-saver';
import Button from '../gen3-ui-component/components/Button';
import { jsonToString } from '../utils';
import Popup from '../components/Popup';
import { contactEmail, credentialCdisPath } from '../localconf';
import KeyTable from '../components/tables/KeyTable';
import ReduxUserInformation from './ReduxUserInformation';
import './UserProfile.css';

const NO_API_KEY = "You don't have any API key. Please create one!";
const CONFIRM_DELETE_MSG = 'Are you sure you want to make this key inactive?';
const SECRET_KEY_MSG =
  'This secret key is only displayed this time. Please save it!';
export const CREATE_API_KEY_BTN = 'Create API key';

/**
 * @param {string} savingStr
 * @param {string} filename
 */
export const saveToFile = (savingStr, filename) => {
  const blob = new Blob([savingStr], { type: 'text/json' });
  FileSaver.saveAs(blob, filename);
};

/** @typedef {import('../types').PopupState} PopupState */

/**
 * @typedef {Object} UserProfileData
 * @property {any} [create_error]
 * @property {any} [delete_error]
 * @property {{ exp: number; jti: string; }[]} [jtis]
 * @property {{ api_key: string; key_id: string; refreshCred: string; }} [refreshCred]
 * @property {string} [requestDeleteJTI]
 * @property {number} [requestDeleteExp]
 * @property {string} [strRefreshCred]
 */

/**
 * @typedef {Object} UserProfileProps
 * @property {() => void} onClearCreationSession
 * @property {() => void} onClearDeleteSession
 * @property {(path: string) => void} onCreateKey
 * @property {(jti: string, exp: number, path: string) => void} onDeleteKey
 * @property {(jti: string, exp: number) => void} onRequestDeleteKey
 * @property {(state: Partial<PopupState>) => void} onUpdatePopup
 * @property {Partial<PopupState>} popups
 * @property {import('./UserInformation').UserInformationProps} userInformation
 * @property {UserProfileData} userProfile
 */

/** @param {UserProfileProps} props */
function UserProfile({
  onClearCreationSession,
  onClearDeleteSession,
  onCreateKey,
  onDeleteKey,
  onRequestDeleteKey,
  onUpdatePopup,
  popups,
  userInformation,
  userProfile,
}) {
  const onCreate = () => {
    onCreateKey(credentialCdisPath);
  };

  const savePopupClose = () => {
    onUpdatePopup({ saveTokenPopup: false });
    onClearCreationSession();
  };

  const createPopupClose = () => {
    onClearDeleteSession();
    onUpdatePopup({ deleteTokenPopup: false });
  };

  return (
    <div className='user-profile'>
      {userProfile.jtis === undefined ? (
        <div>
          You have no access to storage service. Please contact the
          administrator (<a href={`mailto:${contactEmail}`}>{contactEmail}</a>)
          to get it!
        </div>
      ) : (
        <ul className='user-profile__key-pair-table'>
          {popups.deleteTokenPopup === true && (
            <Popup
              message={CONFIRM_DELETE_MSG}
              error={jsonToString(userProfile.delete_error)}
              iconName='cross-key'
              title='Inactivate API Key'
              leftButtons={[
                {
                  caption: 'Cancel',
                  fn: createPopupClose,
                },
              ]}
              rightButtons={[
                {
                  caption: 'Confirm',
                  fn: () =>
                    onDeleteKey(
                      userProfile.requestDeleteJTI,
                      userProfile.requestDeleteExp,
                      popups.keypairsApi
                    ),
                },
              ]}
              onClose={createPopupClose}
            />
          )}
          {popups.saveTokenPopup === true && (
            <Popup
              message={SECRET_KEY_MSG}
              error={jsonToString(userProfile.create_error)}
              lines={[
                { label: 'Key id:', code: userProfile.refreshCred.key_id },
                {
                  label: 'API key:',
                  code: userProfile.refreshCred.api_key.replace(/./g, '*'),
                },
              ]}
              iconName='key'
              title='Created API Key'
              leftButtons={[
                {
                  caption: 'Close',
                  fn: savePopupClose,
                },
              ]}
              rightButtons={[
                {
                  caption: 'Download json',
                  fn: () =>
                    saveToFile(userProfile.strRefreshCred, 'credentials.json'),
                  icon: 'download',
                },
                {
                  caption: 'Copy',
                  fn: () =>
                    navigator.clipboard.writeText(userProfile.strRefreshCred),
                  icon: 'copy',
                },
              ]}
              onClose={savePopupClose}
            />
          )}
          <ReduxUserInformation {...userInformation} />
          <Button
            onClick={onCreate}
            label={CREATE_API_KEY_BTN}
            buttonType='primary'
            rightIcon='key'
          />
          {userProfile.jtis.length === 0 ? (
            <div>{NO_API_KEY}</div>
          ) : (
            <KeyTable
              jtis={userProfile.jtis}
              onDelete={(jti) => {
                onRequestDeleteKey(jti.jti, jti.exp);
                onUpdatePopup({
                  deleteTokenPopup: true,
                  keypairsApi: credentialCdisPath,
                });
              }}
            />
          )}
        </ul>
      )}
    </div>
  );
}

UserProfile.propTypes = {
  onClearCreationSession: PropTypes.func.isRequired,
  onCreateKey: PropTypes.func.isRequired,
  onUpdatePopup: PropTypes.func.isRequired,
  onDeleteKey: PropTypes.func.isRequired,
  onRequestDeleteKey: PropTypes.func.isRequired,
  onClearDeleteSession: PropTypes.func.isRequired,
  popups: PropTypes.exact({
    deleteTokenPopup: PropTypes.bool,
    keypairsApi: PropTypes.string,
    saveTokenPopup: PropTypes.bool,
  }).isRequired,
  userInformation: PropTypes.exact({
    email: PropTypes.string.isRequired,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    institution: PropTypes.string,
    updateInformation: PropTypes.func,
  }).isRequired,
  userProfile: PropTypes.exact({
    create_error: PropTypes.any,
    delete_error: PropTypes.any,
    jtis: PropTypes.arrayOf(
      PropTypes.exact({ jti: PropTypes.string, exp: PropTypes.number })
    ),
    refreshCred: PropTypes.exact({
      api_key: PropTypes.string,
      key_id: PropTypes.string,
      refreshCred: PropTypes.string,
    }),
    requestDeleteJTI: PropTypes.string,
    requestDeleteExp: PropTypes.number,
    strRefreshCred: PropTypes.any,
  }).isRequired,
};

export default UserProfile;
