"use client";

import { useLogoutMutation, useUserProfile } from "@/app/queryHandler/auth";
import {
  adminSidebarNavigation,
  merchantSidebarNavigation,
  NavigationItem,
} from "@/constants/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutUser } from "@/store/slice/userService/userService";
import {
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  SettingsIcon,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FiLogOut } from "react-icons/fi";
import { SettingsModal } from "./SettingsModal";
import { Skeleton } from "./ui/skeleton";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  triggerRef?: React.RefObject<HTMLButtonElement>;
}

type NavItem = {
  key?: string;
  name: string;
  path?: string;
  icon?: React.ReactNode;
  children?: Array<NavItem>;
};

const Sidebar: React.FC<SidebarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  triggerRef,
}) => {
  const user = useAppSelector((state) => state.userService.user);
  const { mutate: logoutMutation, data } = useLogoutMutation();
  const { refreshToken, isAuthenticated } = user;
  const {
    isMerchant,
    isLoading,
    fullName,
    hasAllPermissions,
    hasAnyPermission,
    hasPermission,
  } = useUserProfile();

  const navigation: NavigationItem[] =
    isMerchant && isAuthenticated
      ? merchantSidebarNavigation
      : adminSidebarNavigation;

  const filterByPermission = (items: NavigationItem[]): NavigationItem[] => {
    return items
      .filter((item) => {
        if (!item.permission) return true;
        return hasPermission(item.permission);
      })
      .map((item) => {
        if (item.children) {
          return {
            ...item,
            children: filterByPermission(item.children),
          };
        }
        return item;
      })
      .filter((item) => {
        if (item.children) {
          return item.children.length > 0;
        }
        return true;
      });
  };

  const links = filterByPermission(navigation);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const sidebar = useRef<HTMLElement>(null);

  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [openKey, setOpenKey] = useState<string | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-expanded");
    if (saved && !isMobile) setSidebarExpanded(saved === "true");
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem("sidebar-expanded", sidebarExpanded.toString());
    }
  }, [sidebarExpanded, isMobile]);

  useEffect(() => {
    const clickHandler = (e: MouseEvent) => {
      if (!sidebar.current) return;
      if (!sidebarOpen) return;
      const target = e.target as Node;
      if (sidebar.current.contains(target)) return;
      if (triggerRef?.current && triggerRef.current.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener("mousedown", clickHandler);
    return () => document.removeEventListener("mousedown", clickHandler);
  }, [sidebarOpen, setSidebarOpen, triggerRef]);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [pathname, isMobile, setSidebarOpen]);

  const toggleExpanded = () => {
    if (isMobile) return;
    if (sidebarExpanded) {
      setOpenKey(null);
      setSidebarExpanded(false);
    } else {
      setSidebarExpanded(true);
    }
  };

  const handleLogout = () => {
    logoutMutation({ refreshToken: refreshToken || "" });
  };

  useEffect(() => {
    if (data?.data.success === true) {
      router.push("/login");
      dispatch(logoutUser());
    }
  }, [data, router, dispatch]);

  const withKeys = (items: NavItem[], parentKey = ""): NavItem[] =>
    items.map((it, idx) => {
      const k = it.key ?? `${parentKey}${it.name || it.path || "item"}-${idx}`;
      return {
        ...it,
        key: k,
        children: it.children ? withKeys(it.children, `${k}-`) : undefined,
      };
    });

  const keyedLinks = withKeys(links);

  const onParentClick = (item: NavItem) => {
    if (!item.key) return;
    if (!sidebarExpanded && !isMobile) {
      setSidebarExpanded(true);
      setOpenKey(item.key);
      return;
    }
    setOpenKey((prev) => (prev === item.key ? null : item.key!));
  };

  const baseAside =
    "fixed top-0 left-0 z-40 h-screen bg-primary text-white transition-all duration-300 ease-in-out overflow-hidden lg:overflow-visible lg:static lg:translate-x-0";
  const mobileState = isMobile
    ? sidebarOpen
      ? "translate-x-0 w-72 pointer-events-auto"
      : "-translate-x-full w-72 pointer-events-none"
    : "";
  const desktopState = !isMobile ? (sidebarExpanded ? "w-72" : "w-24") : "";

  return (
    <>
      {sidebarOpen && isMobile && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
        />
      )}

      <aside
        ref={sidebar}
        className={`${baseAside} ${mobileState} ${desktopState}`}
      >
        {!isLoading ? (
          <>
            <div className="relative flex items-center justify-between p-4 pr-10">
              <Link href="/dashboard" className="flex items-center gap-2 px-4">
                <div className="border border-white h-10 w-10 rounded-full bg-black" />
                {(sidebarExpanded || isMobile) && (
                  <p className="text-white text-lg font-semibold">{fullName}</p>
                )}
              </Link>

              {!isMobile && (
                <button
                  onClick={toggleExpanded}
                  className="hidden lg:flex absolute top-3 -right-4 z-50 bg-[#262626] border border-[#404040] rounded-full shadow-md p-1"
                  aria-label={
                    sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"
                  }
                >
                  {sidebarExpanded ? (
                    <ChevronsLeft className="w-6 h-6" />
                  ) : (
                    <ChevronsRight className="w-6 h-6" />
                  )}
                </button>
              )}

              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 hover:bg-gray-700 rounded-lg"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="flex flex-1 min-h-0 flex-col h-[90%] px-4">
              <nav className="flex-1 min-h-0 overflow-y-auto py-4">
                <ul className="space-y-1 pb-2">
                  {keyedLinks.map((link) => (
                    <SidebarLinks
                      key={link.key}
                      link={link}
                      sidebarExpanded={sidebarExpanded || isMobile}
                      isOpen={openKey === link.key}
                      onParentClick={() => onParentClick(link)}
                      onLeafClick={() => {
                        if (isMobile) setSidebarOpen(false);
                      }}
                    />
                  ))}
                </ul>
              </nav>
              <div className="mt-auto pt-4 pb-6 px-4 space-y-4 text-sm">
                <button
                  type="button"
                  className="cursor-pointer flex items-center space-x-4"
                  onClick={() => setOpen(true)}
                >
                  <SettingsIcon className="size-6" />
                  {(sidebarExpanded || isMobile) && <span>Settings</span>}
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center space-x-4 text-white cursor-pointer transition-colors"
                >
                  <div className="rotate-180">
                    <FiLogOut className="size-6" />
                  </div>
                  {(sidebarExpanded || isMobile) && <span>Logout</span>}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col h-full p-4 space-y-6">
            {/* Profile Header Skeleton */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full bg-gray-600/50" />
              <Skeleton className="h-5 w-32 bg-gray-600/50" />
            </div>

            {/* Navigation Links Skeleton */}
            <div className="flex flex-col space-y-3 mt-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5 rounded bg-gray-600/50" />
                  <Skeleton className="h-4 w-36 bg-gray-600/50" />
                </div>
              ))}
            </div>

            {/* Footer Skeleton (Settings & Logout) */}
            <div className="mt-auto space-y-3 pt-6 border-t border-white/10">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded bg-gray-600/50" />
                <Skeleton className="h-4 w-28 bg-gray-600/50" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded bg-gray-600/50" />
                <Skeleton className="h-4 w-24 bg-gray-600/50" />
              </div>
            </div>
          </div>
        )}
      </aside>

      <SettingsModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

interface SidebarLinksProps {
  link: NavItem;
  sidebarExpanded: boolean;
  isOpen: boolean;
  onParentClick: () => void;
  onLeafClick: () => void;
}

const SidebarLinks: React.FC<SidebarLinksProps> = ({
  link,
  sidebarExpanded,
  isOpen,
  onParentClick,
  onLeafClick,
}) => {
  const pathname = usePathname();
  const hasChildren = !!link.children?.length;
  const isActive =
    (!!link.path && (pathname.endsWith(link.path) || pathname === link.path)) ||
    false;

  return (
    <li>
      <div
        onClick={() => (hasChildren ? onParentClick() : undefined)}
        className={`flex items-center justify-between text-sm cursor-pointer px-4 py-2 shrink-0 rounded-md transition-colors ${
          isActive
            ? "bg-white text-primary font-semibold"
            : "hover:bg-white hover:text-primary text-white"
        }`}
      >
        {hasChildren ? (
          <div className="flex items-center gap-3">
            <span className="text-lg">{link.icon}</span>
            {sidebarExpanded && <span>{link.name}</span>}
          </div>
        ) : (
          <Link
            href={link.path || "#"}
            className="flex items-center gap-3 w-full"
            onClick={onLeafClick}
          >
            <span className="text-lg">{link.icon}</span>
            {sidebarExpanded && <span>{link.name}</span>}
          </Link>
        )}
        {hasChildren && sidebarExpanded && (
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </div>

      {hasChildren && isOpen && sidebarExpanded && (
        <ul className="mt-1 space-y-1">
          {link.children!.map((sub) => {
            const isSubActive =
              (!!sub.path &&
                (pathname.endsWith(sub.path) || pathname === sub.path)) ||
              false;
            return (
              <li key={sub.key || sub.path || sub.name}>
                <Link
                  href={sub.path || "#"}
                  onClick={onLeafClick}
                  className={`flex items-center gap-4 px-6 py-2 ml-4 text-sm rounded-md ${
                    isSubActive
                      ? "bg-white text-primary font-semibold"
                      : "hover:bg-white hover:text-primary text-white"
                  }`}
                >
                  <span className="text-lg">{sub.icon}</span>
                  <span>{sub.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
};

export default Sidebar;
