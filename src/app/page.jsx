'use client';

import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FaUpload, FaMagic, FaSpinner, FaCopy } from 'react-icons/fa';
import { CopyToClipboard } from 'react-copy-to-clipboard';

export default function Home() {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [subjectCopied, setSubjectCopied] = useState(false);
  const [descriptionCopied, setDescriptionCopied] = useState(false);

  const fileInputRef = useRef(null);

  const resetOutputs = () => {
    setSubject('');
    setDescription('');
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
    } catch (err) {
      console.error(err);
      setSubject('Error');
      setDescription(
        (err.response && err.response.data && err.response.data.description) ||
        err.message ||
        'An error occurred during processing.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-900 text-gray-100">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* File Upload Card */}
        <Card
          className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer ${isDragging
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
            <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FaMagic className="mr-2 h-4 w-4" />
          )}
          {isLoading ? 'Generating...' : 'Generate'}
        </Button>

        {/* Always-visible Subject & Description */}
        <div className="space-y-6 mt-6">
          {/* Subject Field */}
          <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-100 mb-2">
              Subject
            </h2>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject will appear here..."
                className="flex-1 bg-gray-700 text-gray-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
              <CopyToClipboard
                text={subject}
                onCopy={() => setSubjectCopied(true)}
              >
                <Button
                  variant="ghost"
                  className="text-teal-400 hover:text-teal-500"
                >
                  <FaCopy />
                </Button>
              </CopyToClipboard>
              {subjectCopied && (
                <span className="text-teal-400">Copied!</span>
              )}
            </div>
          </div>

          {/* Description Field */}
          <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-100 mb-2">
              Description
            </h2>
            <div className="flex items-start space-x-2">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description will appear here..."
                rows={6}
                className="flex-1 bg-gray-700 text-gray-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
              />
              <CopyToClipboard
                text={description}
                onCopy={() => setDescriptionCopied(true)}
              >
                <Button
                  variant="ghost"
                  className="text-teal-400 hover:text-teal-500 mt-1"
                >
                  <FaCopy />
                </Button>
              </CopyToClipboard>
              {descriptionCopied && (
                <span className="text-teal-400 mt-1">Copied!</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
