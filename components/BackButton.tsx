import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const BackButton = () => {
  const router = useRouter();
  const handleBack = () => {
    router.back();
  };
  return (
    <div
      className="flex items-center font-semibold gap-2 bg-[#F5F5F5] py-2 px-4 rounded-xl cursor-pointer"
      onClick={handleBack}
    >
      <ArrowLeft size={24} />
      <span>Back</span>
    </div>
  );
};

export default BackButton;
