export default function LoadingState({ message = 'Loading data...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-base-600" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent-lime animate-spin" />
      </div>
      <p className="text-sm text-txt-muted">{message}</p>
    </div>
  );
}
