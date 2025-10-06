'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { generateConditionReportAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

type ImageUploaderProps = {
  onReportGenerated: (report: string) => void;
  setIsLoading: (isLoading: boolean) => void;
};

type FileWithPreview = File & { preview: string };

export function ImageUploader({ onReportGenerated, setIsLoading }: ImageUploaderProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      })
    );
    setFiles((prevFiles) => [...prevFiles, ...newFiles].slice(0, 10)); // Limit to 10 files
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 10,
  });

  const removeFile = (fileToRemove: FileWithPreview) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file !== fileToRemove));
    URL.revokeObjectURL(fileToRemove.preview);
  };
  
  const handleGenerateReport = async () => {
    if (files.length === 0) {
      toast({ title: "No images", description: "Please upload at least one image.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setIsGenerating(true);

    const fileToDataUri = (file: File) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });

    try {
        const dataUris = await Promise.all(files.map(fileToDataUri));
        const report = await generateConditionReportAction(dataUris);
        onReportGenerated(report);
    } catch(e) {
        toast({ title: "Report Generation Failed", description: "Could not generate the condition report.", variant: "destructive" });
    } finally {
        setIsLoading(false);
        setIsGenerating(false);
    }
  };
  
  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks
    return () => files.forEach(file => URL.revokeObjectURL(file.preview));
  }, [files]);


  const dropzoneStyle = useMemo(() => ({
    borderColor: isDragActive ? 'hsl(var(--primary))' : 'hsl(var(--border))',
    backgroundColor: isDragActive ? 'hsl(var(--accent) / 0.1)' : 'transparent',
  }), [isDragActive]);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>AI Condition Report</CardTitle>
        <CardDescription>Upload property photos to generate an AI-powered condition analysis.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          {...getRootProps()}
          style={dropzoneStyle}
          className="p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all"
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <UploadCloud className="h-10 w-10" />
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <p>Drag & drop photos here, or click to select</p>
            )}
            <p className="text-xs">(Up to 10 images)</p>
          </div>
        </div>

        {files.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {files.map((file) => (
              <div key={file.name} className="relative group">
                <Image
                  src={file.preview}
                  alt={file.name}
                  width={100}
                  height={100}
                  className="rounded-md object-cover w-full aspect-square"
                />
                <button
                  onClick={() => removeFile(file)}
                  className="absolute top-1 right-1 bg-destructive/80 text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <Button onClick={handleGenerateReport} disabled={files.length === 0 || isGenerating} className="w-full">
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isGenerating ? 'Generating...' : 'Generate Condition Report'}
        </Button>
      </CardContent>
    </Card>
  );
}
