"use client";

import { Button } from "@/components/ui/button";

export function SessionManager() {
  const sessions = [
    { ip: "103.89.110.172", date: "26th July, 2025", active: true },
    { ip: "103.89.110.172", date: "26th July, 2025", active: false },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold mb-8">Session</h2>

      <div className="space-y-2 flex flex-col">
        <h3 className="">Current Session</h3>
        <p className="text-sm text-[#595959]">
          Windows <span className="text-[#222222]">{sessions[0].ip}</span>
        </p>

        <div className="px-2 py-1 bg-[#007AFF] w-fit text-white font-semibold">
          Active Now
        </div>

        <p className="">
          Last accessed: <span>{sessions[0].date}</span>
        </p>
      </div>

      <div className="space-y-4">
        <p className="">
          This is a list of devices that have logged into your account. Revoke
          any sessions that you do not recognize.
        </p>
        {sessions.map((s, i) => (
          <div key={i} className="space-y-2">
            <p className="text-sm font-semibold">Windows {s.ip}</p>
            <p className="text-xs text-muted-foreground">
              Last accessed: {s.date}
            </p>
            <Button size="sm" className="mt-2">
              Revoke Access
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
