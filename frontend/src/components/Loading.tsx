interface LoadingProps {
  message?: string;
}

export const Loading = ({ message = 'Carregando...' }: LoadingProps) => {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#B22222] mx-auto mb-4"></div>
        <div className="text-xl text-gray-600">{message}</div>
      </div>
    </div>
  );
};
