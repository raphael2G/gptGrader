'use client'

interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64 rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
      <p className="text-lg">{message}</p>
    </div>
  );
}

