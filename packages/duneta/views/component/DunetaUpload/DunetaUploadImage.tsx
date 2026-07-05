import { DunetaUpload } from './DunetaUpload';
import type { DunetaUploadProps } from './DunetaUpload';

// Image upload defaults.

export type DunetaUploadImageProps = DunetaUploadProps;

export function DunetaUploadImage(props: DunetaUploadImageProps) {
  return <DunetaUpload {...props} accept="image/*" label={props.label ?? 'Upload image'} />;
}
