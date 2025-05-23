import { Input } from "@/components/ui/input";
import Image from "next/image";

import { useState } from "react";
type ImageUploaderProps = {
  source: string;
  image: File | null;
  setImage: (file: File) => void;
};

const ImageUploader = ({ source, image, setImage }: ImageUploaderProps) => {
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="flex flex-col items-center justify-center gap-y-2">
      <div className="w-[200px] h-[200px] rounded-full overflow-hidden border-2 border-orange-800">
        <Image
          src={preview || source}
          alt=""
          width={200}
          height={200}
          className="object-cover w-full h-full"
          unoptimized
        />
      </div>
      <Input type="file" onChange={handleImageChange} />
    </div>
  );
};

export default ImageUploader;
