import { Branded } from './index';

export type SvgIcon = Branded<string, 'SvgIcon'>;

const _SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

const _isSvgMarkup = (icon: string): boolean => {
  const markup = icon.trim();

  if (!markup) {
    return false;
  }

  if (typeof DOMParser === 'undefined') {
    return /^<svg\b[\s\S]*<\/svg>$/.test(markup);
  }

  const document = new DOMParser().parseFromString(markup, 'image/svg+xml');

  if (document.querySelector('parsererror')) {
    return false;
  }

  return (
    document.documentElement.localName === 'svg' &&
    document.documentElement.namespaceURI === _SVG_NAMESPACE
  );
};

export const isSvgIcon = (icon: string): icon is SvgIcon => _isSvgMarkup(icon);

export const convertToSvgIcon = (icon: string): SvgIcon => {
  if (!_isSvgMarkup(icon)) {
    throw new Error('Invalid SVG markup passed to convertToSvgIcon.');
  }

  return icon as SvgIcon;
};
