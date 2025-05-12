'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';      // adjust as needed
import { Button } from '@/components/ui/button';  // adjust as needed
import { FaUpload, FaMagic, FaSpinner, FaCopy } from 'react-icons/fa';

export default function Home() {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [subjectCopied, setSubjectCopied] = useState(false);
  const [descriptionCopied, setDescriptionCopied] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'text/plain' || file.name.endsWith('.diff'))) {
      setSelectedFile(file);
      setErrorMessage('');
      setSubject('');
      setDescription('');
    } else {
      setSelectedFile(null);
      setErrorMessage('Invalid file type. Please upload a diff file (.diff).');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'text/plain' || file.name.endsWith('.diff'))) {
      setSelectedFile(file);
      setErrorMessage('');
      setSubject('');
      setDescription('');
    } else {
      setSelectedFile(null);
      setErrorMessage('Invalid file type. Please upload a diff file (.diff).');
      e.target.value = null;
    }
  };

  const handleGenerateClick = async () => {
    if (!selectedFile) return;
    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('/api/process', formData);
      const data = response.data;
      setSubject(data.subject || '');
      setDescription(data.description || '');
    } catch (error) {
      console.error('Error processing file:', error);
      setSubject('Error');
      setDescription(
        error.response?.data?.description ||
        error.message ||
        'An error occurred during processing.'
      );
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto space-y-8">

        <Card
          className={`p-8 border-2 border-dashed ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            } rounded-lg text-center cursor-pointer`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            {selectedFile ? (
              <p className="text-gray-700 font-medium">
                Selected: {selectedFile.name}
              </p>
            ) : (
              <p className="text-gray-600">
                Drag and drop your diff file here, or
              </p>
            )}
            <input
              type="file"
              id="fileInput"
              className="hidden"
              onChange={handleFileUpload}
              accept=".diff"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('fileInput').click()}
              className="bg-blue-500 text-white hover:bg-blue-600"
              disabled={isLoading}
            >
              <FaUpload className="mr-2 h-4 w-4" />
              Choose File
            </Button>
          </div>
        </Card>

        {errorMessage && (
          <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
        )}

        <Button
          className="w-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          onClick={handleGenerateClick}
          disabled={!selectedFile || isLoading}
        >
          {isLoading ? (
            <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FaMagic className="mr-2 h-4 w-4" />
          )}
          {isLoading ? 'Generating...' : 'Generate'}
        </Button>

        {/* Result output */}
        {subject && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Subject</h2>
              <div className="flex items-center">
                <p className="flex-1">{subject}</p>
                <CopyToClipboard
                  text={subject}
                  onCopy={() => setSubjectCopied(true)}
                >
                  <Button className="ml-2">
                    <FaCopy className="h-4 w-4" />
                  </Button>
                </CopyToClipboard>
                {subjectCopied && (
                  <span className="ml-2 text-green-500">Copied!</span>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold">Description</h2>
              <div className="flex items-start">
                <pre className="flex-1 whitespace-pre-wrap">
                  {description}
                </pre>
                <CopyToClipboard
                  text={description}
                  onCopy={() => setDescriptionCopied(true)}
                >
                  <Button className="ml-2">
                    <FaCopy className="h-4 w-4" />
                  </Button>
                </CopyToClipboard>
                {descriptionCopied && (
                  <span className="ml-2 text-green-500">Copied!</span>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
