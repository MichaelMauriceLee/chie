import { Link, useLocation } from '@remix-run/react';
import React from 'react';

const NavBar: React.FC = () => {
  const location = useLocation()
  const modalUrl = location.pathname + location.search + '#modal'

  return (
    <div className="flex justify-between items-end" style={{ marginTop: '4px' }}>
      <Link
        className="text-9xl hover:text-blue-500 rounded focus:outline-none focus:ring focus:border-blue-500"
        type="button"
        to="/"
      >
        Chie
      </Link>

      <Link
        className="hover:text-blue-500 rounded-full md:h-16 md:w-16 h-8 w-8 mt-4 focus:outline-none focus:ring focus:border-blue-500"
        aria-label="Settings"
        type="button"
        to={modalUrl}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
            clipRule="evenodd"
          />
        </svg>
      </Link>
    </div>
  );
};

export default NavBar;
