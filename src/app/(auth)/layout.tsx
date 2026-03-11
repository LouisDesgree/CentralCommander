import { ParticleField } from '@/components/ui/ParticleField';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <ParticleField count={50} maxOpacity={0.25} speed={0.15} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
