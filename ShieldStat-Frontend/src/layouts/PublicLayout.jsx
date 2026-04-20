import { Outlet } from "react-router-dom";

function PublicLayout({ isDarkMode, onToggleDarkMode }) {
  return (
    <Outlet context={{ isDarkMode, onToggleDarkMode }} />
  );
}

export default PublicLayout;
