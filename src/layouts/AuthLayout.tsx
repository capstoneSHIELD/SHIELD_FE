import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden bg-white">
      <div className="flex flex-1 flex-col items-center justify-start">
        <div className="flex min-h-0 w-full flex-1 flex-col sm:mx-auto sm:max-w-[448px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
