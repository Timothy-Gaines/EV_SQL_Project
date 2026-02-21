import { AlertTriangle } from 'lucide-react';

export default function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-12 h-12 rounded-full bg-accent-pink/10 flex items-center justify-center">
        <AlertTriangle size={22} className="text-accent-pink" />
      </div>
      <p className="text-sm text-txt-secondary max-w-md text-center">{message}</p>
    </div>
  );
}
