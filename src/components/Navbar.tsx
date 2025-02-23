"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export const Navbar = () => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [currentPath, setCurrentPath] = useState<string>("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    if (pathname) {
      setCurrentPath(pathname);
    }
  }, [pathname]);

  const navigation = [
    { name: "Deliver", href: "/home" },
    { name: "Overview", href: "/overview" },
    { name: "Simulator", href: "/simulator" },
    { name: "About", href: "/about" },
  ];

  const isActive = (href: string) => pathname === href;

  const handleDropdownToggle = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    if (href === "/solutions") {
      e.preventDefault();
      handleDropdownToggle("Solutions");
    }
  };

  return (
    <div className="w-full shadow-md">
      <div className="w-full container relative flex flex-wrap items-center justify-between px-8 py-6 mx-auto">
        <Disclosure>
          {({ open }) => (
            <div className="flex flex-wrap items-center justify-between w-full lg:w-auto">
              <Link href="/home">
                <span className="flex items-center space-x-2 text-2xl text-customRed">
                  <span>
                    <Image
                      src="/img/logo.png"
                      alt="Logo"
                      width={100}
                      height={100}
                      style={{ height: '1em', width: 'auto' }}
                    />
                  </span>
                  <span className="font-bold">
                    RobotDashboard
                  </span>
                </span>
              </Link>

              <DisclosureButton
                aria-label="Toggle Menu"
                className={`px-2 py-1 ml-auto rounded-md lg:hidden ${open ? "text-customRed bg-indigo-200" : "text-gray-500 hover:text-customRed"
                  } focus:outline-none`}
              >
                <svg
                  className="w-6 h-6 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24">
                  {open && (
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
                    />
                  )}
                  {!open && (
                    <path
                      fillRule="evenodd"
                      d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
                    />
                  )}
                </svg>
              </DisclosureButton>

              <DisclosurePanel className="flex flex-col w-full my-4 lg:hidden">
                {navigation.map((item, index) => (
                  <div key={index} className="relative">
                    <a
                      href={item.href}
                      className="flex w-full px-2 py-2 text-gray-700 rounded-md hover:text-customRed focus:text-customRed focus:bg-indigo-200"
                    >
                      {item.name}
                    </a>
                  </div>
                ))}
                {session ? (
                  <button
                    onClick={() => signOut()}
                    className="mt-4 px-6 py-2 text-white bg-red-500 rounded-md text-md"
                  >
                    Sign Out
                  </button>
                ) : (
                  <Link href="/api/auth/signin" className="mt-4 px-6 py-2 text-white bg-blue-600 rounded-md text-md">
                    Sign In
                  </Link>
                )}
              </DisclosurePanel>
            </div>

          )}
        </Disclosure>

        <div className="hidden text-center lg:flex w-1/2">
          <ul className="items-center justify-end flex-1 pt-6 list-none lg:pt-0 lg:flex">
            {navigation.map((item, index) => (
              <li key={index} className="relative group">
                <a
                  href={item.href}
                  onClick={(e) => handleLinkClick(e, item.href)}
                  className={`inline-flex items-center px-4 py-2 text-md font-normal no-underline rounded-md hover:text-customRed ${isActive(item.href)
                    ? "text-customRed bg-indigo-200"
                    : "text-gray-800"
                    }`}
                >
                  {item.name}
                </a>

              </li>
            ))}
          </ul>


        </div>

        <div className="hidden lg:block">
          <div className="w-full items-end">
            {status === "loading" ? (
              <p className="text-gray-500 hidden">Loading...</p> // Optional loading state
            ) : session ? (
              <button
                onClick={() => signOut()}
                className="p-3 text-white bg-gray-700 rounded-md text-md"
              >
                Sign Out
              </button>
            ) : (
              <Link href="/api/auth/signin" className="p-3 text-white bg-blue-600 rounded-md text-md">
                Sign In
              </Link>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
