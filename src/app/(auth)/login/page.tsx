import { GlassCard } from '@/components/ui/GlassCard';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { Command } from 'lucide-react';

export default function LoginPage() {
  return (
    <GlassCard variant="elevated" padding="lg" className="w-full max-w-sm">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center">
          <Command className="w-8 h-8 text-blue-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">CentralCommander</h1>
          <p className="text-sm text-gray-400 mt-1">
            Your central hub for managing your digital life
          </p>
        </div>
        <GoogleSignInButton />
        <p className="text-xs text-gray-400">
          Sign in to connect your Gmail and AI assistant
        </p>
      </div>
    </GlassCard>
  );
}
