import { DateMaskPreset } from '../config';

export default function getDateMaskRegexp(mask: string): RegExp {
  // find regexp in DateMaskPreset first
  for (const [ preset, regexp ] of Object.entries(DateMaskPreset)) {
    if (mask === preset) {
      return new RegExp(regexp);
    }
  }
  // if not found, treat mask as regexp directly
  return new RegExp(mask);
}
