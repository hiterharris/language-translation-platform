"use client"

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload } from 'lucide-react';
import { storage } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

export function UploadDialog() {
  const [sourceLanguage, setSourceLanguage] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (!sourceLanguage || !targetLanguage) {
        toast({
          title: "Error",
          description: "Please select source and target languages",
          variant: "destructive"
        });
        return;
      }

      setUploading(true);
      try {
        const file = acceptedFiles[0];
        const reader = new FileReader();
        
        reader.onload = async () => {
          try {
            // Create document record
            const document = await storage.createDocument({
              title: file.name,
              file_path: URL.createObjectURL(file),
              file_type: file.type,
              source_language: sourceLanguage,
              target_language: targetLanguage,
              status: 'pending',
              metadata: {
                size: file.size,
                lastModified: file.lastModified
              },
              content: "",
              translations: []
            });

            toast({
              title: "Success",
              description: "Document uploaded successfully"
            });
          } catch (error) {
            console.error('Upload error:', error);
            toast({
              title: "Error",
              description: "Failed to upload document",
              variant: "destructive"
            });
          }
        };

        reader.readAsArrayBuffer(file);
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: "Error",
          description: "Failed to upload document",
          variant: "destructive"
        });
      } finally {
        setUploading(false);
      }
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg">
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Select onValueChange={setSourceLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Source Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dari">Dari</SelectItem>
                <SelectItem value="pashto">Pashto</SelectItem>
                <SelectItem value="uzbek">Uzbek</SelectItem>
                <SelectItem value="tajik">Tajik</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Select onValueChange={setTargetLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Target Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="dari">Dari</SelectItem>
                <SelectItem value="pashto">Pashto</SelectItem>
                <SelectItem value="uzbek">Uzbek</SelectItem>
                <SelectItem value="tajik">Tajik</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer">
            <input {...getInputProps()} />
            <p className="text-sm text-muted-foreground">
              Drag and drop files here, or click to select files
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}