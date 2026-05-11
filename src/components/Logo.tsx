import Image from 'next/image';
import Link from 'next/link';
import { clsx } from 'clsx';

interface LogoProps {
  size?: number;
  withWordmark?: boolean;
  asLink?: boolean;
  className?: string;
}

export const Logo = ({
  size = 40,
  withWordmark = false,
  asLink = false,
  className,
}: LogoProps) => {
  const content = (
    <span className={clsx('inline-flex items-center gap-2', className)}>
      <Image
        src="/logo.png"
        alt="JaMoveo"
        width={size}
        height={size}
        priority
        className="rounded-md"
        style={{ width: size, height: size, objectFit: 'contain' }}
      />
      {withWordmark && (
        <span className="text-lg font-bold tracking-tight text-neutral-100">
          Ja<span className="text-brand-light">Moveo</span>
        </span>
      )}
    </span>
  );

  if (asLink) {
    return (
      <Link href="/" className="inline-flex">
        {content}
      </Link>
    );
  }
  return content;
};
