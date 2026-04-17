interface ErrorMessageProps {
  message: string;
  fullScreen?: boolean;
}

export const ErrorMessage = ({ message, fullScreen = false }: ErrorMessageProps) => {
  if (fullScreen) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-xl text-red-600 font-semibold">{message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      <p className="font-semibold">{message}</p>
    </div>
  );
};
