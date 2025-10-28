// Reference: blueprint:javascript_object_storage
import { useState } from "react";
import Uppy from "@uppy/core";
import { DashboardModal } from "@uppy/react";
import AwsS3 from "@uppy/aws-s3";
import type { UploadResult } from "@uppy/core";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onUploadComplete?: (result: UploadResult) => void;
}

export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760, // 10MB default
  onUploadComplete,
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [uppy] = useState(() =>
    new Uppy({
      restrictions: {
        maxNumberOfFiles,
        maxFileSize,
      },
      autoProceed: false,
    })
      .use(AwsS3, {
        shouldUseMultipart: false,
        getUploadParameters: async (file) => {
          // Get presigned upload URL from our backend
          const response = await fetch("/api/objects/upload", {
            method: "POST",
            credentials: "include",
          });
          const { uploadURL } = await response.json();
          
          return {
            method: "PUT" as const,
            url: uploadURL,
            headers: {
              "Content-Type": file.type || "application/octet-stream",
            },
          };
        },
      })
      .on("complete", (result) => {
        if (result.successful.length > 0) {
          // Extract object key from upload URL
          const uploadedFile = result.successful[0];
          const uploadUrl = uploadedFile.uploadURL;
          const objectKey = uploadUrl ? new URL(uploadUrl).pathname : "";
          
          // Add objectKey to response
          uploadedFile.response = {
            ...uploadedFile.response,
            objectKey: objectKey,
          };
          
          onUploadComplete?.(result);
          setShowModal(false);
        }
      })
  );

  return (
    <div>
      <Button 
        onClick={() => setShowModal(true)} 
        variant="outline"
        type="button"
        className="w-full"
        data-testid="button-upload-file"
      >
        <Upload className="h-4 w-4 mr-2" />
        Selecionar Arquivo
      </Button>

      <DashboardModal
        uppy={uppy}
        open={showModal}
        onRequestClose={() => setShowModal(false)}
        proudlyDisplayPoweredByUppy={false}
      />
    </div>
  );
}
