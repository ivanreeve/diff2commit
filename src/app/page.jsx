'use client';

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FaMagic } from 'react-icons/fa';
import { FaCheck } from 'react-icons/fa6';
import { CgSpinner } from "react-icons/cg";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { MdOutlineContentCopy } from "react-icons/md"
import { FaRegFolderOpen } from "react-icons/fa";
import Image from 'next/image';
import logo from '../../public/favicon-dark.svg';

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
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSubjectTooltip, setShowSubjectTooltip] = useState(false);
  const [showDescriptionTooltip, setShowDescriptionTooltip] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0); // true only when scrolled down
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      setShowSubjectTooltip(true);
      setTimeout(() => {
        setSubjectCopied(false);
        setShowSubjectTooltip(false);
      }, 2000);
    } else {
      setDescriptionCopied(true);
      setShowDescriptionTooltip(true);
      setTimeout(() => {
        setDescriptionCopied(false);
        setShowDescriptionTooltip(false);
      }, 2000);
    }
  };

  // Skeleton loading animation component
  const Skeleton = ({ className }) => (
      <div className={`animate-pulse bg-gray-700 rounded ${className}`}></div>
  );

  return (
      <>
        <main className="min-h-screen bg-[linear-gradient(108deg,#151517_0%,#121215_50%,#111014_75%,#0F0E13_100%)]">
          <style jsx global>{scrollbarStyles}</style>
          {/* Navbar */}
          <nav
              className={`${
                  isScrolled ? 'fixed top-0 left-0' : 'relative'
              } w-full z-50 bg-[#17171A] backdrop-blur-md border-b border-[#4F5156] transition-all duration-300`}
          >
            <div className="max-w-7xl mx-auto flex items-center gap-3 p-2">
              <Image src={logo} alt="Logo" width={40} height={40} />
              <h1 className="text-white text-xl font-bold">Diff2Commit</h1>
            </div>
          </nav>

          <div className="flex flex-row gap-6 justify-center items-start mt-8">
            <div className="space-y-6">
              {/* Subject Field */}
              <div className="bg-[#17171A] border border-[#4F5156] rounded-sm min-w-[720px] max-w-[1000px]">
                <div className="flex justify-between items-center flex-row p-2">
                  <h2 className="text-md text-[#4F5156]">Commit Message</h2>
                  <div className="relative">
                    <CopyToClipboard
                        text={subject}
                        onCopy={() => handleCopy('subject')}
                    >
                      <button
                          disabled={!isGenerated || !subject}
                          className="text-[#4F5156] hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 rounded-md cursor-pointer"
                      >
                        {subjectCopied ? <FaCheck /> : <MdOutlineContentCopy />}
                      </button>
                    </CopyToClipboard>
                    {showSubjectTooltip && (
                        <div className="absolute -top-10 right-0 bg-[#1B1B1F] text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                          Copied!
                          <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#1B1B1F]"></div>
                        </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isLoading ? (
                      <Skeleton className="flex-1 h-10" />
                  ) : (
                      <input
                          type="text"
                          value={subject}
                          onChange={(e) => isGenerated && setSubject(e.target.value)}
                          placeholder={isGenerated ? "Subject will appear here..." : "Generate to see subject..."}
                          className={`flex-1 bg-[#1B1B1F] text-gray-100 border-t border-[#4F5156] p-2 rounded-b-sm focus:outline-none ${isGenerated ? "focus:ring-1 focus:ring-gray-400" : "cursor-not-allowed"}`}
                          readOnly={!isGenerated}
                      />
                  )}
                </div>
              </div>

              {/* Description Field */}
              <div className="bg-[#17171A] border border-[#4F5156] rounded-sm h-96xl">
                <div className="flex justify-between items-center flex-row p-2">
                  <h2 className="text-md text-[#4F5156]">
                    Description
                  </h2>
                  <div className="relative">
                    <CopyToClipboard
                        text={description}
                        onCopy={() => handleCopy('description')}
                    >
                      <button
                          disabled={!isGenerated || !description}
                          className="text-[#4F5156] hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 rounded-md cursor-pointer"
                      >
                        {descriptionCopied ? <FaCheck /> : <MdOutlineContentCopy />}
                      </button>
                    </CopyToClipboard>
                    {showDescriptionTooltip && (
                        <div className="absolute -top-10 right-0 bg-[#1B1B1F] text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                          Copied!
                          <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#1B1B1F]"></div>
                        </div>
                    )}
                  </div>
                </div>
                <div className="flex items-start">
                  {isLoading ? (
                      <Skeleton className="flex-1 h-36" />
                  ) : (
                      <textarea
                          value={description}
                          onChange={(e) => isGenerated && setDescription(e.target.value)}
                          placeholder={isGenerated ? "Description will appear here..." : "Generate to see description..."}
                          rows={10}
                          className={`flex-1 bg-[#1B1B1F] text-gray-100 border-t border-[#4F5156] p-2 rounded-b-sm focus:outline-none ${isGenerated ? "focus:ring-1 focus:ring-gray-400" : "cursor-not-allowed"} resize-none custom-scrollbar max-h-96 overflow-y-auto`}
                          readOnly={!isGenerated}
                      />
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* File Upload Card */}
              <Card
                  className={`p-8 border-2 border-dashed rounded-md text-center cursor-pointer ${isDragging
                      ? 'border-blue-400 bg-[#1B1B1F]'
                      : 'border-[#4F5156] bg-[#1B1B1F]'
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
                      onClick={handleButtonClick}
                      className="gradient-btn text-gray-900 cursor-pointer rounded-sm"
                      disabled={isLoading}
                  >
                    <FaRegFolderOpen className="w-6 h-6" />
                    Choose File
                  </Button>
                </div>
              </Card>

              {errorMessage && (
                  <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
              )}

              <div className="flex justify-end">
                {/* Generate Button */}
                <Button
                    className='w-40 h-12 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-md gradient-btn cursor-pointer'
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
              </div>
            </div>
          </div>
        </main>
      </>
  );
}