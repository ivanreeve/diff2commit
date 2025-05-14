'use client';

import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FaUpload, FaMagic, FaCopy, FaCheck } from 'react-icons/fa';
import { CgSpinner } from "react-icons/cg";
import { CopyToClipboard } from 'react-copy-to-clipboard';

// Custom scrollbar styles
const scrollbarStyles = `
  /* Firefox */
  * {
    scrollbar-width: thick;
    scrollbar-color: #2dd4bf #1f2937;
  }
  
  /* Chrome, Edge, and Safari */
  *::-webkit-scrollbar {
    width: 10px;
  }
  
  *::-webkit-scrollbar-track {
    background: #1f2937;
  }
  
  *::-webkit-scrollbar-thumb {
    background-color: #2dd4bf;
  }
  
  *::-webkit-scrollbar-thumb:hover {
    background-color: #14b8a6;
  }
`;

export default function Home() {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [subjectCopied, setSubjectCopied] = useState(false);
  const [descriptionCopied, setDescriptionCopied] = useState(false);

  const fileInputRef = useRef(null);

  const resetOutputs = () => {
    setSubject('');
    setDescription('');
    setIsGenerated(false);
    setSubjectCopied(false);
    setDescriptionCopied(false);
  };

  const validateFile = (file) => {
    const name = file.name.toLowerCase();
    const ok =
      file.type === 'text/plain' ||
      name.endsWith('.diff');
    if (!ok) {
      setErrorMessage('Invalid file type. Please upload a .diff file.');
      resetOutputs();
      setSelectedFile(null);
    } else {
      setErrorMessage('');
      resetOutputs();
    }
    return ok;
  };

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
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
    // allow same-file reselect
    e.target.value = '';
  };

  const handleButtonClick = (e) => {
    e.stopPropagation(); // Stop the event from bubbling up to the Card
    fileInputRef.current?.click();
  };

  const handleGenerateClick = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsLoading(true);
    setIsGenerated(false);
    setSubjectCopied(false);
    setDescriptionCopied(false);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const { data } = await axios.post('/api/process', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSubject(data.subject || '');
      setDescription(data.description || '');
      setIsGenerated(true);
    } catch (err) {
      console.error(err);
      setSubject('Error');
      setDescription(
        (err.response && err.response.data && err.response.data.description) ||
        err.message ||
        'An error occurred during processing.'
      );
      setIsGenerated(true); // Still consider it generated even if it's an error
    } finally {
      setIsLoading(false);
    }
  };

  // Handle copy button state
  const handleCopy = (field) => {
    if (field === 'subject') {
      setSubjectCopied(true);
      setTimeout(() => setSubjectCopied(false), 2000);
    } else {
      setDescriptionCopied(true);
      setTimeout(() => setDescriptionCopied(false), 2000);
    }
  };

  // Skeleton loading animation component
  const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-gray-700 rounded ${className}`}></div>
  );

  return (
    <main className="min-h-screen p-8 bg-gray-900 text-gray-100">
      <style jsx global>{scrollbarStyles}</style>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* File Upload Card */}
        <Card
          className={`p-8 border-2 border-dashed rounded-md text-center cursor-pointer ${isDragging
            ? 'border-teal-400 bg-gray-800'
            : 'border-gray-700 bg-gray-800'
            }`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            {selectedFile ? (
              <p className="text-gray-100 font-medium">
                Selected: {selectedFile.name}
              </p>
            ) : (
              <p className="text-gray-400">
                Drag and drop your .diff file here, or
              </p>
            )}

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".diff,text/plain"
              onChange={handleFileUpload}
            />

            <Button
              variant="outline"
              onClick={handleButtonClick}
              className="bg-teal-400 text-gray-900 hover:bg-teal-500 disabled:opacity-50"
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

        {/* Generate Button */}
        <Button
          className={
            'w-full bg-teal-400 text-gray-900 hover:bg-teal-500 ' +
            'disabled:opacity-50 disabled:cursor-not-allowed ' +
            'flex items-center justify-center'
          }
          onClick={handleGenerateClick}
          disabled={!selectedFile || isLoading}
        >
          {isLoading ? (
            <CgSpinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FaMagic className="mr-2 h-4 w-4" />
          )}
          {isLoading ? 'Generating...' : 'Generate'}
        </Button>

        {/* Always-visible Subject & Description */}
        <div className="space-y-6 mt-6">
          {/* Subject Field */}
          <div className="bg-gray-800 border border-gray-700 p-4 rounded-md shadow-sm">
            <h2 className="text-xl font-semibold text-gray-100 mb-2">
              Subject
            </h2>
            <div className="flex items-center space-x-2">
              {isLoading ? (
                <Skeleton className="flex-1 h-10" />
              ) : (
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => isGenerated && setSubject(e.target.value)}
                  placeholder={isGenerated ? "Subject will appear here..." : "Generate to see subject..."}
                  className={`flex-1 bg-gray-700 text-gray-100 p-2 rounded focus:outline-none ${isGenerated ? "focus:ring-2 focus:ring-teal-400" : "cursor-not-allowed"}`}
                  readOnly={!isGenerated}
                />
              )}
              <CopyToClipboard
                text={subject}
                onCopy={() => handleCopy('subject')}
                className="rounded-md"
              >
                <Button
                  variant="ghost"
                  className="text-teal-400 hover:text-teal-500"
                  disabled={!isGenerated || !subject}
                >
                  {subjectCopied ? <FaCheck /> : <FaCopy />}
                </Button>
              </CopyToClipboard>
            </div>
          </div>

          {/* Description Field */}
          <div className="bg-gray-800 border border-gray-700 p-4 rounded-md shadow-sm">
            <h2 className="text-xl font-semibold text-gray-100 mb-2">
              Description
            </h2>
            <div className="flex items-start space-x-2">
              {isLoading ? (
                <Skeleton className="flex-1 h-36" />
              ) : (
                <textarea
                  value={description}
                  onChange={(e) => isGenerated && setDescription(e.target.value)}
                  placeholder={isGenerated ? "Description will appear here..." : "Generate to see description..."}
                  rows={10}
                  className={`flex-1 bg-gray-700 text-gray-100 p-2 rounded focus:outline-none ${isGenerated ? "focus:ring-2 focus:ring-teal-400" : "cursor-not-allowed"} resize-none custom-scrollbar max-h-96 overflow-y-auto`}
                  readOnly={!isGenerated}
                />
              )}
              <CopyToClipboard
                text={description}
                onCopy={() => handleCopy('description')}
                className="rounded-md"
                disabled={!isGenerated || !description}
              >
                <Button
                  variant="ghost"
                  className="text-teal-400 hover:text-teal-500 mt-1"
                  disabled={!isGenerated || !description}
                >
                  {descriptionCopied ? <FaCheck /> : <FaCopy />}
                </Button>
              </CopyToClipboard>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
