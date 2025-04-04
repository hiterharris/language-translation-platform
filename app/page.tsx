"use client"

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, ArrowRightLeft, Loader2, Menu, FileText, Image, Mic, Video, Sidebar, Plus, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { storage, Document, Translation } from '@/lib/storage';

export default function Home() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const { toast } = useToast();

  const languages = [
    { code: 'dari', name: 'Dari' },
    { code: 'pashto', name: 'Pashto' },
    { code: 'uzbek', name: 'Uzbek' },
    { code: 'tajik', name: 'Tajik' },
    { code: 'english', name: 'English' }
  ];

  const documentTypes = [
    { id: 'text', name: 'Text Documents', icon: FileText, mimeTypes: ['text/plain', 'application/pdf', 'application/msword'] },
    { id: 'image', name: 'Images', icon: Image, mimeTypes: ['image/jpeg', 'image/png', 'image/gif'] },
    { id: 'audio', name: 'Audio', icon: Mic, mimeTypes: ['audio/mpeg', 'audio/wav'] },
    { id: 'video', name: 'Video', icon: Video, mimeTypes: ['video/mp4', 'video/mpeg'] }
  ];

  useEffect(() => {
    loadDocuments();
  }, [selectedDocType, selectedLanguage]);

  const loadDocuments = async () => {
    try {
      const allDocs = await storage.getDocuments();
      let filteredDocs = allDocs;

      if (selectedDocType) {
        const docType = documentTypes.find(dt => dt.id === selectedDocType);
        if (docType) {
          filteredDocs = filteredDocs.filter(doc => 
            docType.mimeTypes.some(mime => doc.file_type.startsWith(mime.split('/')[0]))
          );
        }
      }

      if (selectedLanguage) {
        filteredDocs = filteredDocs.filter(doc => 
          doc.source_language === selectedLanguage || doc.target_language === selectedLanguage
        );
      }

      setDocuments(filteredDocs);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive"
      });
    }
  };

  const handleTranslate = async () => {
    if (!sourceText || !sourceLanguage || !targetLanguage) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsTranslating(true);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceText,
          sourceLanguage,
          targetLanguage
        }),
      });

      if (!response.ok) throw new Error('Translation failed');

      const data = await response.json();
      setTranslatedText(data.translation);

      toast({
        title: "Success",
        description: "Translation completed successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Translation failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwapLanguages = () => {
    const tempLang = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(tempLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleDocTypeSelect = (docType: string) => {
    if (docType === selectedDocType) {
      setSelectedDocType(null);
    } else {
      setSelectedDocType(docType);
      setSelectedLanguage(null);
      setSourceLanguage('');
      setTargetLanguage('');
    }
    setSelectedDocument(null); // Clear selected document
  };

  const handleLanguageSelect = (lang: string) => {
    if (lang === selectedLanguage) {
      setSelectedLanguage(null);
    } else {
      setSelectedLanguage(lang);
      setSelectedDocType(null);
      setSourceLanguage('');
      setTargetLanguage('');
    }
    setSelectedDocument(null); // Clear selected document
  };

  const clearSelections = () => {
    setSelectedDocType(null);
    setSelectedLanguage(null);
    setSourceLanguage('');
    setTargetLanguage('');
    setSourceText('');
    setTranslatedText('');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="header-gradient text-white">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:text-white/80 hover:bg-white/10"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Sidebar className="h-6 w-6" />
            </Button>
            <Globe className="h-6 w-6" />
            <h1 className="text-xl font-semibold">Language Translation Platform</h1>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "w-64 border-r p-6 space-y-8 transition-all duration-300 transform bg-gray-50",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {/* New Translation Button */}
          <div>
            <Button
              className="w-full header-gradient text-white"
              onClick={clearSelections}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Translation
            </Button>
          </div>

          <div>
            <h2 className="text-sm font-semibold mb-4 text-gray-700">DOCUMENT TYPES</h2>
            <div className="space-y-2">
              {documentTypes.map((docType) => {
                const Icon = docType.icon;
                return (
                  <Button 
                    key={docType.id}
                    variant={selectedDocType === docType.id ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      selectedDocType === docType.id ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "hover:bg-gray-100"
                    )}
                    onClick={() => handleDocTypeSelect(docType.id)}
                  >
                    <Icon className="mr-2 h-4 w-4" /> {docType.name}
                  </Button>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold mb-4 text-gray-700">LANGUAGES</h2>
            <div className="space-y-2">
              {languages.map((lang) => (
                <Button 
                  key={lang.code}
                  variant={selectedLanguage === lang.code ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    selectedLanguage === lang.code ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "hover:bg-gray-100"
                  )}
                  onClick={() => handleLanguageSelect(lang.code)}
                >
                  {lang.name}
                </Button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className={cn(
          "flex-1 transition-all duration-300 bg-gray-50",
          isSidebarOpen ? "ml-0" : "ml-0"
        )}>
          <div className="container mx-auto py-8 px-4">
            {selectedDocument ? (
              <div>
                <Button 
                  variant="ghost" 
                  className="mb-4"
                  onClick={() => setSelectedDocument(null)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Documents
                </Button>
                <Card className="bg-white shadow-lg">
                  <CardHeader>
                    <CardTitle>{selectedDocument.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm text-muted-foreground mb-1">Source Language</h3>
                          <p>{languages.find(l => l.code === selectedDocument.source_language)?.name || selectedDocument.source_language}</p>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-sm text-muted-foreground mb-1">Target Language</h3>
                          <p>{languages.find(l => l.code === selectedDocument.target_language)?.name || selectedDocument.target_language}</p>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-sm text-muted-foreground mb-1">File Type</h3>
                          <p>{selectedDocument.file_type}</p>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-muted-foreground mb-1">Content</h3>
                        <p className="mt-2">{selectedDocument.content}</p>
                      </div>
                      {selectedDocument.translations && selectedDocument.translations.length > 0 && (
                        <div>
                          <h3 className="font-medium text-sm text-muted-foreground mb-2">Translations</h3>
                          <div className="space-y-2">
                            {selectedDocument.translations.map((translation: Translation, index: number) => (
                              <div key={index} className="p-4 border rounded-lg bg-gray-50">
                                <p className="font-medium text-sm text-muted-foreground mb-1">
                                  {languages.find(l => l.code === translation.language)?.name || translation.language}
                                </p>
                                <p>{translation?.content}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* Show either filtered documents or universal translator */
              (selectedDocType || selectedLanguage) ? (
                <Card className="bg-white shadow-lg">
                  <CardHeader>
                    <CardTitle>
                      {selectedDocType ? documentTypes.find(dt => dt.id === selectedDocType)?.name : 'All Documents'} 
                      {selectedLanguage && ` - ${languages.find(l => l.code === selectedLanguage)?.name}`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {documents.length > 0 ? (
                        documents.map((doc) => (
                          <div 
                            key={doc.id} 
                            className="p-4 border rounded-lg hover:border-blue-500 transition-colors cursor-pointer"
                            onClick={() => setSelectedDocument(doc)}
                          >
                            <h3 className="font-medium">{doc.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {doc.file_type} • {doc.status}
                            </p>
                            {doc.content && (
                              <p className="mt-2 text-sm">{doc.content}</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-muted-foreground">
                          No documents found for the selected filters
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="max-w-4xl mx-auto bg-white shadow-lg">
                  <CardHeader>
                    <CardTitle>Universal Translator</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-start">
                      {/* Source Language */}
                      <div className="space-y-4">
                        <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                          <SelectTrigger className="border-gray-300 focus:ring-blue-500">
                            <SelectValue placeholder="Select source language" />
                          </SelectTrigger>
                          <SelectContent>
                            {languages.map((lang) => (
                              <SelectItem key={lang.code} value={lang.code}>
                                {lang.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Textarea
                          placeholder="Enter text to translate..."
                          className="min-h-[200px] border-gray-300 focus:ring-blue-500"
                          value={sourceText}
                          onChange={(e) => setSourceText(e.target.value)}
                        />
                      </div>

                      {/* Swap Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mt-12 hover:bg-blue-50"
                        onClick={handleSwapLanguages}
                        disabled={isTranslating}
                      >
                        <ArrowRightLeft className="h-4 w-4" />
                      </Button>

                      {/* Target Language */}
                      <div className="space-y-4">
                        <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                          <SelectTrigger className="border-gray-300 focus:ring-blue-500">
                            <SelectValue placeholder="Select target language" />
                          </SelectTrigger>
                          <SelectContent>
                            {languages.map((lang) => (
                              <SelectItem key={lang.code} value={lang.code}>
                                {lang.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Textarea
                          placeholder="Translation will appear here..."
                          className="min-h-[200px] border-gray-300 focus:ring-blue-500 bg-gray-50"
                          value={translatedText}
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Button
                        size="lg"
                        onClick={handleTranslate}
                        disabled={isTranslating || !sourceText || !sourceLanguage || !targetLanguage}
                        className="header-gradient text-white px-8"
                      >
                        {isTranslating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Translating...
                          </>
                        ) : (
                          'Translate'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </main>
      </div>
    </div>
  );
}