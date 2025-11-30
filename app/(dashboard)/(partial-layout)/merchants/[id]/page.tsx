const MerchantDetails = () => {
  return (
    <div className="space-y-12">
      {/* Section 1: Merchant Basic Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Merchant’s Basic Information
          </h2>
          <p className="text-sm text-gray-600">
            View and manage the merchant’s official identity, registration, and
            industry classification.
          </p>
        </div>

        <div className="bg-white rounded-md p-6 space-y-4 w-full">
          <div className="flex items-center justify-center">
            <div className="rounded-full h-16 w-16 bg-green-400 flex items-center justify-center">
              <span className="text-white font-bold text-xl">🏢</span>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-gray-500">Merchant Name</p>
              <p className="bg-gray-100 rounded-md px-4 py-2">AG-Blueprint</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">RC-Number</p>
              <p className="bg-gray-100 rounded-md px-4 py-2 font-semibold">
                RC12345678
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Business Type</p>
              <p className="bg-gray-100 rounded-md px-4 py-2 font-semibold">
                Sole Proprietor
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Industry</p>
              <p className="bg-gray-100 rounded-md px-4 py-2">Design</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Contact Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Merchant’s Contact Information
          </h2>
          <p className="text-sm text-gray-600">
            These are the primary contact channels for this merchant.
          </p>
        </div>

        <div className="bg-white rounded-md p-6 space-y-4 w-full">
          <div>
            <p className="text-sm text-gray-500">Business Email</p>
            <p className="bg-gray-100 rounded-md px-4 py-2">
              support@agblueorint.com
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Business Phone Number</p>
            <p className="bg-gray-100 rounded-md px-4 py-2">09121216846</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">
              Contact Person’s
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Contact Person’s Name</p>
            <p className="bg-gray-100 rounded-md px-4 py-2">Ada Dennis</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">WhatsApp Phone Number</p>
            <p className="bg-gray-100 rounded-md px-4 py-2">09121216846</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email Address</p>
            <p className="bg-gray-100 rounded-md px-4 py-2">
              ada.dennis@email.com
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Current Residential Address</p>
            <p className="bg-gray-100 rounded-md px-4 py-2">
              23 orishirishi estate, ejor street, Lagos
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Address Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Address Details</h2>
          <p className="text-sm text-gray-600">
            This is the registered business location of the merchant.
          </p>
        </div>

        <div className="bg-white rounded-md p-6 space-y-4 w-full">
          <div>
            <p className="text-sm text-gray-500">Street Address</p>
            <p className="bg-gray-100 rounded-md px-4 py-2">
              12 Admiralty Way, Lekki Phase 1
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Country</p>
            <p className="bg-gray-100 rounded-md px-4 py-2">Nigeria</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">State/Province</p>
            <p className="bg-gray-100 rounded-md px-4 py-2">Lagos</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">City</p>
            <p className="bg-gray-100 rounded-md px-4 py-2">Lagos State</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Postal Code</p>
            <p className="bg-gray-100 rounded-md px-4 py-2">105102</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantDetails;
