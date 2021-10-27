import React from 'react';
import PropTypes from 'prop-types';
import './Footer.css';

/**
 * @param {Object} props
 * @param {string} [props.dataVersion]
 * @param {{ href: string; text: string; }[]} [props.links]
 * @param {{ alt: string; height: number; href: string; src: string; }[]} props.logos
 * @param {{ footerHref: string; text: string; }} [props.privacyPolicy]
 */
function Footer({ dataVersion = '', links, logos, privacyPolicy }) {
  return (
    <footer>
      <nav className='footer__nav' aria-label='Footer Navigation'>
        {dataVersion !== '' && (
          <div className='footer__data-release-version-area'>
            <span className='footer__data-release-version-area--title'>
              Data Release Version:
            </span>
            {dataVersion}
          </div>
        )}
        <div className='footer__spacer-area' />
        {privacyPolicy?.text && (
          <div className='footer__privacy-policy-area'>
            <a
              className='h4-typo footer__privacy-policy'
              href={privacyPolicy.footerHref}
              target='_blank'
              rel='noopener noreferrer'
            >
              {privacyPolicy.text}
            </a>
          </div>
        )}
        <div className='footer__logo-area'>
          {logos.map(({ alt, height, href, src }, i) => (
            <a
              key={i}
              target='_blank'
              href={href}
              className='footer__icon'
              rel='noopener noreferrer'
            >
              <img
                className='footer__img'
                src={src}
                alt={alt}
                style={{ height: height ?? 60 }}
              />
            </a>
          ))}
        </div>
        <div className='footer__link-area'>
          {links?.map(({ href, text }) => (
            <a
              key={href}
              href={href}
              className='footer__link'
              target='_blank'
              rel='noopener noreferrer'
            >
              {text || href}
            </a>
          ))}
        </div>
      </nav>
    </footer>
  );
}

Footer.propTypes = {
  dataVersion: PropTypes.string,
  links: PropTypes.arrayOf(
    PropTypes.exact({
      href: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    })
  ),
  logos: PropTypes.arrayOf(
    PropTypes.exact({
      alt: PropTypes.string.isRequired,
      height: PropTypes.number,
      href: PropTypes.string.isRequired,
      src: PropTypes.string.isRequired,
    })
  ).isRequired,
  privacyPolicy: PropTypes.exact({
    footerHref: PropTypes.string,
    text: PropTypes.string,
  }),
};

export default Footer;
