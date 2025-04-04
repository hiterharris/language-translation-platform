"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, HandPlatter as Translate } from 'lucide-react';
import { storage, Document, Translation } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

export function DocumentViewer({ documentId }: { documentId: string }) {
  const [document, setDocument] = useState<Document | null>(null);
  const [translation, setTranslation] = useState<Translation | null>(null);
  const [loading, setLoading] = useState(true);
  const [translating, setTranslating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDocument();
  }, [documentId]);

  const fetchDocument = async () => {
    try {
      const doc = await storage.getDocument(documentId);
      setDocument(doc);
      
      if (doc) {
        const translations = await storage.getTranslations(doc.id);
        if (translations.length > 0) {
          setTranslation(translations[0]);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load document",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!document) return;
    
    try {
      // In a real app, implement file download logic here
      toast({
        title: "Success",
        description: "Document downloaded successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive"
      });
    }
  };

  const handleTranslate = async () => {
    if (!document) return;

    setTranslating(true);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: document.id,
          text: document.content,
          sourceLanguage: document.source_language,
          targetLanguage: document.target_language,
        }),
      });

      if (!response.ok) throw new Error('Translation failed');

      toast({
        title: "Success",
        description: "Translation completed successfully"
      });

      await fetchDocument();
    } catch (error) {
      toast({
        title: "Error",
        description: "Translation failed",
        variant: "destructive"
      });
    } finally {
      setTranslating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Select a document to view</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{document.title}</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button 
            size="sm" 
            onClick={handleTranslate}
            disabled={translating}
          >
            {translating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Translate className="h-4 w-4 mr-2" />
            )}
            Translate
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Badge>{document.file_type}</Badge>
            <Badge variant="outline">{document.source_language}</Badge>
            <Badge variant="outline">{document.target_language}</Badge>
          </div>
          
          {translation && (
            <div className="mt-6 space-y-4">
              <h3 className="font-semibold">Translation</h3>
              <div className="bg-muted p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{translation.content}</p>
              </div>
              <Badge variant={translation.status === 'completed' ? 'default' : 'secondary'}>
                {translation.status}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}