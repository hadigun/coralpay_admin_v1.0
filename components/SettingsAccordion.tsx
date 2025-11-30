"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function SettingsAccordion() {
  const [openSection, setOpenSection] = useState<string | null>("basic");
  const [editing, setEditing] = useState<string | null>(null);

  const handleAccordionChange = (value: string | null) => {
    setOpenSection(value);
    if (value !== editing) setEditing(null);
  };

  return (
    <div className="overflow-y-auto">
      <h2>Settings</h2>
      <Accordion
        type="single"
        collapsible
        value={openSection ?? undefined}
        onValueChange={handleAccordionChange}
        className="space-y-4 divide-y-0"
      >
        {/* 1. Basic Info */}
        <AccordionItem
          value="basic"
          //   className="flex items-center flex-col w-full"
          className="w-full border border-lineColor"
        >
          <AccordionTrigger className="text-lg font-semibold ">
            <div className="">
              {" "}
              Merchant’s Basic Information
              <Button
                variant="link"
                size="sm"
                onClick={() => setEditing(editing === "basic" ? null : "basic")}
              >
                {editing === "basic" ? "Cancel" : "Edit"}
              </Button>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-4">
            <div className="space-y-3 py-4">
              <Input
                label="Merchant Name"
                defaultValue="Kunde LLC"
                disabled={editing !== "basic"}
              />
              <Input label="RC Number" defaultValue="RC12345678" disabled />
              <Input
                label="Business Type"
                defaultValue="Sole Proprietor"
                disabled={editing !== "basic"}
              />
              <Input
                label="Industry"
                defaultValue="Design"
                disabled={editing !== "basic"}
              />
              {editing === "basic" && (
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setEditing(null)}>
                    Cancel
                  </Button>
                  <Button>Save Changes</Button>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 2. Contact Info */}
        <AccordionItem className="border border-lineColor" value="contact">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="">
              Merchant’s Contact Information
              <Button
                variant="link"
                size="sm"
                onClick={() =>
                  setEditing(editing === "contact" ? null : "contact")
                }
              >
                {editing === "contact" ? "Cancel" : "Edit"}
              </Button>
            </div>
          </AccordionTrigger>
          <AccordionContent className="border-t">
            <div className="space-y-3 px-2 py-4">
              <Input
                label="Business Email"
                defaultValue="support@agblueprint.com"
                disabled={editing !== "contact"}
              />
              <Input
                label="Business Phone Number"
                defaultValue="09121216846"
                disabled={editing !== "contact"}
              />
              <Input
                label="Contact Person’s Name"
                defaultValue="Ada Dennis"
                disabled={editing !== "contact"}
              />
              <Input
                label="WhatsApp Phone Number"
                defaultValue="09121216846"
                disabled={editing !== "contact"}
              />
              <Input
                label="Email Address"
                defaultValue="ada.dennis@email.com"
                disabled={editing !== "contact"}
              />
              <Textarea
                placeholder="Current Residential Address"
                defaultValue="23 orishirishi estate, ajor street, Lagos"
                disabled={editing !== "contact"}
              />
              {editing === "contact" && (
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setEditing(null)}>
                    Cancel
                  </Button>
                  <Button>Save Changes</Button>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 3. Address Info */}
        <AccordionItem className="border border-lineColor" value="address">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="">
              Address Details
              <Button
                variant="link"
                size="sm"
                onClick={() =>
                  setEditing(editing === "address" ? null : "address")
                }
              >
                {editing === "address" ? "Cancel" : "Edit"}
              </Button>
            </div>
          </AccordionTrigger>
          <AccordionContent className="border-t border-lineColor">
            <div className="space-y-3 px-4 py-4">
              <Input
                label="Street Address"
                defaultValue="12 Admiralty Way, Lekki Phase 1"
                disabled={editing !== "address"}
              />
              <Input
                label="Country"
                defaultValue="Nigeria"
                disabled={editing !== "address"}
              />
              <Input
                label="State/Province"
                defaultValue="Lagos"
                disabled={editing !== "address"}
              />
              <Input
                label="City"
                defaultValue="Lagos State"
                disabled={editing !== "address"}
              />
              <Input
                label="Postal Code"
                defaultValue="106102"
                disabled={editing !== "address"}
              />
              {editing === "address" && (
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setEditing(null)}>
                    Cancel
                  </Button>
                  <Button>Save Changes</Button>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
