import { useUserProfile } from "@/app/queryHandler/auth";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import * as React from "react";
import { LuCircleUserRound } from "react-icons/lu";
import { PiEqualizerBold, PiShieldCheckBold } from "react-icons/pi";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { ProfileForm } from "./ProfileForm";
import { SessionManager } from "./SessionManager";

type TabKey = "profile" | "password" | "session";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const user = useAppSelector((state) => state.userService.user);
  // const isAdmin = user?.email === "admin@coralpay.com";
  const { isMerchant } = useUserProfile();
  // const isAdmin = user?.email === "admin@coralpay.com";
  console.log(isMerchant);

  const [activeTab, setActiveTab] = React.useState<TabKey>("profile");
  const sidebarRef = React.useRef<HTMLDivElement>(null);

  const tabs = React.useMemo<
    Array<{
      key: TabKey;
      label: string;
      icon: React.ReactNode;
      content: React.ReactNode;
    }>
  >(
    () => [
      {
        key: "profile",
        label: "Profile",
        icon: <LuCircleUserRound size={22} />,
        // content: !isMerchant ? <ProfileForm /> : <SettingsAccordion />,
        content: <ProfileForm />,
        // content: !isMerchant ? <ProfileForm /> : <SettingsAccordion />,
      },
      {
        key: "password",
        label: "Change Password",
        icon: <PiShieldCheckBold size={22} />,
        content: <ChangePasswordForm />,
      },
      {
        key: "session",
        label: "Session",
        icon: <PiEqualizerBold size={22} />,
        content: <SessionManager />,
      },
    ],
    [isMerchant]
  );

  const onSidebarKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      const order = tabs.map((t) => t.key);
      const currentIndex = order.indexOf(activeTab);
      let nextIndex = currentIndex;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          nextIndex = (currentIndex - 1 + order.length) % order.length;
          break;
        case "ArrowDown":
          e.preventDefault();
          nextIndex = (currentIndex + 1) % order.length;
          break;
        case "Home":
          e.preventDefault();
          nextIndex = 0;
          break;
        case "End":
          e.preventDefault();
          nextIndex = order.length - 1;
          break;
        default:
          return;
      }
      setActiveTab(order[nextIndex] as TabKey);
      // Move focus to the new active button:
      const buttons =
        sidebarRef.current?.querySelectorAll<HTMLButtonElement>(
          "button[data-tab]"
        );
      buttons?.[nextIndex]?.focus();
    },
    [activeTab, tabs]
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* Keeping title for a11y; visually hidden via utility if desired */}
      <DialogTitle className="sr-only">Settings</DialogTitle>

      <DialogContent className="p-0 rounded-lg md:max-w-2xl">
        <div className="flex h-[500px]">
          {/* Sidebar */}
          <div
            ref={sidebarRef}
            className="w-1/3 bg-[#F6F3F8] p-5 space-y-4 rounded-l-xl"
            onKeyDown={onSidebarKeyDown}
          >
            <nav
              aria-label="Settings sections"
              className="space-y-2 text-base mt-10"
            >
              {tabs.map((t) => (
                <SidebarTabButton
                  key={t.key}
                  tabKey={t.key}
                  isActive={activeTab === t.key}
                  onSelect={() => setActiveTab(t.key)}
                  icon={t.icon}
                >
                  {t.label}
                </SidebarTabButton>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="w-2/3 overflow-y-auto p-6">
            {tabs.find((t) => t.key === activeTab)?.content}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SidebarTabButton({
  tabKey,
  isActive,
  onSelect,
  icon,
  children,
}: {
  tabKey: TabKey;
  isActive: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      data-tab={tabKey}
      onClick={onSelect}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex w-full items-center text-left py-2 rounded-md transition-colors",
        isActive ? "font-semibold text-primary" : "hover:text-primary"
      )}
    >
      {icon}
      <span className="ml-2">{children}</span>
    </button>
  );
}
