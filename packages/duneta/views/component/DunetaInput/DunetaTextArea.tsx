import { TextArea } from '@heroui/react';
import type { TextAreaProps } from '@heroui/react';

// Base HeroUI textarea.

export type DunetaTextAreaProps = TextAreaProps;

export function DunetaTextArea(props: DunetaTextAreaProps) {
  return <TextArea {...props} />;
}
