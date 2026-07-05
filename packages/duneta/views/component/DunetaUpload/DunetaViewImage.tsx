import { DunetaCard } from '../DunetaCard';

// Image preview card.

export type DunetaViewImageProps = {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
};

export function DunetaViewImage({ src, alt, caption, className = '' }: DunetaViewImageProps) {
  return (
    <DunetaCard className={`overflow-hidden ${className}`}>
      <img className="block h-auto w-full object-cover" src={src} alt={alt} />
      {caption ? <DunetaCard.Footer className="text-sm text-slate-500">{caption}</DunetaCard.Footer> : null}
    </DunetaCard>
  );
}
