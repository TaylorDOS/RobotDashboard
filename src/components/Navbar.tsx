"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { FiChevronDown, FiLogOut, FiUser } from "react-icons/fi";

export const Navbar = () => {
  const { data: session } = useSession();
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

  return (
    <div className="w-full border-b-2 border-gray-200 bg-white shadow-sm">
      <div className="w-full container relative flex flex-wrap items-center justify-between px-8 py-6 mx-auto">
        <Disclosure>
          {({ open }) => (
            <div className="flex flex-wrap items-center justify-between w-full lg:w-auto">
              <Link href="/home">
                <span className="flex items-center space-x-4 text-xl text-customRed">
                  <span>
                    <Image
                      src="/img/logo.png"
                      alt="Logo"
                      width={100}
                      height={100}
                      style={{ height: '2em', width: 'auto' }}
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
                <div className="mt-4 w-full text-center">
                  {session ? (
                    <>
                      <p className="text-sm text-gray-600 mb-2">
                        Signed in as <span className="font-medium text-gray-800">{session.user?.email}</span>
                      </p>
                      <button
                        onClick={() => signOut()}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-red-500 transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 mb-2">Sign in to continue</p>
                      <Link
                        href="/api/auth/signin"
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-blue-500 transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
                      >
                        Sign In
                      </Link>
                    </>
                  )}
                </div>
              </DisclosurePanel>
            </div>

          )}
        </Disclosure>

        <div className="hidden text-center lg:flex">
          <ul className="items-center justify-end flex-1 pt-6 list-none lg:pt-0 lg:flex">
            {navigation.map((item, index) => (
              <li key={index} className="relative group">
                <Link
                  href={item.href}
                  className={`inline-flex items-center px-4 py-2 text-md font-normal no-underline rounded-full hover:text-customRed ${isActive(item.href)
                      ? "text-white bg-blue-600 font-semibold shadow-md"
                      : "text-gray-900"
                    }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>


        </div>

        <div className="hidden lg:block">
          <div className="w-full flex justify-end">
            {session ? (
              <Menu as="div" className="relative inline-block text-left">
                <Menu.Button className="inline-flex items-center gap-2 py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium shadow-md hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600">
                  <span>{session.user?.email}</span>
                  <FiChevronDown className="text-xs" />
                </Menu.Button>
                <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => signOut()}
                          className={`${active ? "bg-red-100 text-red-700" : "text-red-600"
                            } group flex items-center w-full px-4 py-2 text-sm`}
                        >
                          <FiLogOut className="mr-2" />
                          Sign Out
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Menu>
            ) : (
              <Link
                href="/api/auth/signin"
                className="py-2 px-4 bg-blue-600 hover:bg-blue-400 text-white rounded-lg text-sm font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
