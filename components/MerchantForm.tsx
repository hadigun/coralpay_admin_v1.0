"use client";

import { MerchantFormSchema } from "@/app/(dashboard)/(partial-layout)/merchants/validations";
import { useCreateMerchantMutation } from "@/app/queryHandler/merchants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MerchantFormData } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FileUpload } from "./FileUpload";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";

interface FormData {
  // Basic Information
  merchantName: string;
  rcNumber: string;
  businessType: string;
  industry: string;
  logo: File | null;

  // Contact Information
  businessEmail: string;
  businessPhone: string;
  firstName: string;
  lastName: string;
  whatsappPhone: string;
  emailAddress: string;
  residentialAddress: string;

  // Address Details
  streetAddress: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
}

const steps = [
  { id: 1, title: "Merchant Basic Information", key: "basic" },
  { id: 2, title: "Merchant Contact Information", key: "contact" },
  { id: 3, title: "Address Details", key: "address" },
];

export const MerchantForm = () => {
  const router = useRouter();
  const { mutate: createMerchantMutation, isPending } =
    useCreateMerchantMutation();

  const form = useForm({
    resolver: zodResolver(MerchantFormSchema),
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      adminInfo: {
        firstName: "",
        lastName: "",
        email: "",
        mobile: "",
      },
      adConfig: {
        serverAddress: "",
      },
    },
  });

  const onSubmit = (data: MerchantFormData) => {
    createMerchantMutation(data);
  };
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    merchantName: "",
    rcNumber: "",
    businessType: "",
    industry: "",
    logo: null,
    businessEmail: "",
    businessPhone: "",
    firstName: "",
    lastName: "",
    whatsappPhone: "",
    emailAddress: "",
    residentialAddress: "",
    streetAddress: "",
    country: "",
    state: "",
    city: "",
    postalCode: "",
  });

  const updateFormData = (
    field: keyof FormData,
    value: string | File | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getStepIndicatorData = () => {
    return steps.map((step) => ({
      ...step,
      completed: step.id < currentStep,
      active: step.id === currentStep,
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
    // Handle form submission here
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Merchant Basic Information
              </h2>
            </div>

            <FileUpload
              label="Merchant Logo"
              value={formData.logo}
              onFileSelect={(file) => updateFormData("logo", file)}
            />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="merchantName">Merchant Name</Label>
                <Input
                  id="merchantName"
                  placeholder="Enter merchant name"
                  value={formData.merchantName}
                  onChange={(e) =>
                    updateFormData("merchantName", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rcNumber">RC Number</Label>
                <Input
                  id="rcNumber"
                  placeholder="Enter RC Number"
                  value={formData.rcNumber}
                  onChange={(e) => updateFormData("rcNumber", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type</Label>
                <Select
                  value={formData.businessType}
                  onValueChange={(value) =>
                    updateFormData("businessType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Enter business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="wholesale">Wholesale</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => updateFormData("industry", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Enter Industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Merchant Contact Information
              </h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessEmail">Business Email</Label>
                <Input
                  id="businessEmail"
                  type="email"
                  placeholder="Enter business email address"
                  value={formData.businessEmail}
                  onChange={(e) =>
                    updateFormData("businessEmail", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessPhone">Business Phone Number</Label>
                <Input
                  id="businessPhone"
                  placeholder="Enter phone number"
                  value={formData.businessPhone}
                  onChange={(e) =>
                    updateFormData("businessPhone", e.target.value)
                  }
                />
              </div>

              <div className="text-sm font-medium text-foreground mb-2">
                Contact Person's
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={(e) =>
                      updateFormData("firstName", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={(e) => updateFormData("lastName", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsappPhone">WhatsApp Phone Number</Label>
                <Input
                  id="whatsappPhone"
                  placeholder="Enter WhatsApp phone number"
                  value={formData.whatsappPhone}
                  onChange={(e) =>
                    updateFormData("whatsappPhone", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailAddress">Email Address</Label>
                <Input
                  id="emailAddress"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.emailAddress}
                  onChange={(e) =>
                    updateFormData("emailAddress", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="residentialAddress">
                  Current Residential Address
                </Label>
                <Input
                  id="residentialAddress"
                  placeholder="Enter residential address"
                  value={formData.residentialAddress}
                  onChange={(e) =>
                    updateFormData("residentialAddress", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Address Details
              </h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="streetAddress">Street Address</Label>
                <Input
                  id="streetAddress"
                  placeholder="Enter business street address"
                  value={formData.streetAddress}
                  onChange={(e) =>
                    updateFormData("streetAddress", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => updateFormData("country", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Contact Person" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nigeria">Nigeria</SelectItem>
                    <SelectItem value="ghana">Ghana</SelectItem>
                    <SelectItem value="kenya">Kenya</SelectItem>
                    <SelectItem value="southafrica">South Africa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => updateFormData("state", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Contact Person" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lagos">Lagos</SelectItem>
                    <SelectItem value="abuja">Abuja</SelectItem>
                    <SelectItem value="kano">Kano</SelectItem>
                    <SelectItem value="rivers">Rivers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Enter phone number"
                  value={formData.city}
                  onChange={(e) => updateFormData("city", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  placeholder="Enter phone number"
                  value={formData.postalCode}
                  onChange={(e) => updateFormData("postalCode", e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="">
      <div className="grid grid-cols-5 h-screen overflow-hidden">
        {/* Mobile Header
        <div className="md:hidden bg-white border-b p-4">
          <h1 className="text-lg font-semibold">Create a New Merchant</h1>
          <Button variant="ghost" size="icon">
            <X className="h-5 w-5" />
          </Button>
        </div> */}

        {/* Step Indicator - Sidebar on desktop, horizontal on mobile */}
        <div className="hidden lg:flex-shrink-0 col-span-2 h-full w-full mx-auto bg-gradient-to-b from-[#E9D5EF] to-[##F1EBF314]  p-6 lg:p-8 items-center md:flex flex-col">
          {/* <StepIndicator steps={getStepIndicatorData()} /> */}
          <h2 className="text-4xl font-extrabold">Create a New Merchant</h2>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:px-12 md:px-6 py-6 px-4 col-span-5 md:col-span-3 overflow-x-hidden overflow-y-scroll">
          <div className="max-w-2xl mx-auto">
            {/* {renderStepContent()} */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                {/* --- MERCHANT DETAILS SECTION --- */}
                <h2 className="text-xl font-semibold border-b pb-2 text-gray-700">
                  Merchant Account
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Merchant Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Merchant Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Acme Retail Solutions"
                            {...field}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage>
                          {form.formState.errors.name?.message}
                        </FormMessage>
                      </FormItem>
                    )}
                  />

                  {/* Merchant Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="contact@acmeretail.com"
                            type="email"
                            {...field}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage>
                          {form.formState.errors.email?.message}
                        </FormMessage>
                      </FormItem>
                    )}
                  />

                  {/* Merchant Mobile */}
                  <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Mobile</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="0700123456"
                            {...field}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage>
                          {form.formState.errors.mobile?.message}
                        </FormMessage>
                      </FormItem>
                    )}
                  />
                </div>

                {/* --- ADMIN INFO SECTION --- */}
                <h2 className="text-xl font-semibold border-b pt-4 pb-2 text-gray-700">
                  Administrator Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Admin First Name */}
                  <FormField
                    control={form.control}
                    name="adminInfo.firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Jane"
                            {...field}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage>
                          {form.formState.errors.adminInfo?.firstName?.message}
                        </FormMessage>
                      </FormItem>
                    )}
                  />

                  {/* Admin Last Name */}
                  <FormField
                    control={form.control}
                    name="adminInfo.lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Doe"
                            {...field}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage>
                          {form.formState.errors.adminInfo?.lastName?.message}
                        </FormMessage>
                      </FormItem>
                    )}
                  />

                  {/* Admin Email */}
                  <FormField
                    control={form.control}
                    name="adminInfo.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admin Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="admin@acmeretail.com"
                            type="email"
                            {...field}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage>
                          {form.formState.errors.adminInfo?.email?.message}
                        </FormMessage>
                      </FormItem>
                    )}
                  />

                  {/* Admin Mobile */}
                  <FormField
                    control={form.control}
                    name="adminInfo.mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admin Mobile</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="0700123456"
                            {...field}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage>
                          {form.formState.errors.adminInfo?.mobile?.message}
                        </FormMessage>
                      </FormItem>
                    )}
                  />
                </div>

                {/* --- AD CONFIG SECTION --- */}
                <h2 className="text-xl font-semibold border-b pt-4 pb-2 text-gray-700">
                  Ad Configuration
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  {/* Server Address */}
                  <FormField
                    control={form.control}
                    name="adConfig.serverAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ad Server Address (URL)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://api.adserver.com/v1"
                            {...field}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage>
                          {
                            form.formState.errors.adConfig?.serverAddress
                              ?.message
                          }
                        </FormMessage>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="text-gray-600 border-gray-300 hover:bg-gray-50"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Creating..." : "Create Merchant"}
                  </Button>
                </div>
              </form>
            </Form>

            {/* Navigation Buttons */}
            {/* <div className="flex justify-between mt-12 gap-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="px-8"
              >
                Back
              </Button>

              {currentStep === steps.length ? (
                <Button onClick={handleSubmit} className="px-8">
                  Submit
                </Button>
              ) : (
                <Button onClick={handleNext} className="px-8">
                  Next
                </Button>
              )}
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};
