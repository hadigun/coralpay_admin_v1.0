"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ChangePasswordForm() {
  return (
    <>
      <h2 className="text-lg font-semibold mb-8">Change Password</h2>

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Current Password</label>
          <Input type="password" placeholder="Enter your current password" />
        </div>
        <div>
          <label className="block text-sm font-medium">New Password</label>
          <Input type="password" placeholder="Enter a new password" />
        </div>
        <div>
          <label className="block text-sm font-medium">
            Re-type New Password
          </label>
          <Input type="password" placeholder="Confirm your new password" />
        </div>
        <p className="text-sm text-muted-foreground">
          You will be logged out of all devices immediately after successful
          password update
        </p>
        <Button className="mt-2">Change Password</Button>
      </form>
    </>
  );
}
