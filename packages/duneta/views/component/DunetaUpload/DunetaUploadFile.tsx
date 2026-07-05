import { DunetaUpload } from './DunetaUpload';
import type { DunetaUploadProps } from './DunetaUpload';

// File upload defaults.

export type DunetaUploadFileProps = DunetaUploadProps;

export function DunetaUploadFile(props: DunetaUploadFileProps) {
  return <DunetaUpload {...props} label={props.label ?? 'Upload file'} />;
}
