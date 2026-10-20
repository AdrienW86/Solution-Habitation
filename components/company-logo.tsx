import Image from 'next/image';
export function CompanyLogo({ logo }: { logo: { src: string; alt: string } | undefined }) {
  return logo ? (
    <span className="company-logo">
      <Image src={logo.src} alt={logo.alt} width={300} height={120} unoptimized />
    </span>
  ) : null;
}
