import { Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div>
      {/* Layout público genérico, pode adicionar header/footer se necessário */}
      <Outlet />
    </div>
  );
}
