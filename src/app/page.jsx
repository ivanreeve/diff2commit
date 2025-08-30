'use client';

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from "@/components/ui/textarea";
import { FaCheck } from 'react-icons/fa6';
import { CgSpinner } from "react-icons/cg";
import { MdOutlineContentCopy } from "react-icons/md"
import { RiSparklingFill } from "react-icons/ri";
import { LuMail } from "react-icons/lu";
import { MdOutlineDescription } from "react-icons/md";
import { FaRegFolderOpen } from "react-icons/fa";
import Image from 'next/image';
import logo from '../../public/favicon-dark.svg';

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
    e.stopPropagation();
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
      setIsGenerated(true);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      handleCopy(field);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

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

  const Skeleton = ({ className }) => (
      <div className={`animate-pulse bg-gray-700 rounded ${className}`}></div>
  );

  return (
      <>
        <main className="min-h-screen bg-[linear-gradient(108deg,#151517_0%,#121215_50%,#111014_75%,#0F0E13_100%)]">
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
            <div className="space-y-6 w-[1000px]">
              {/* Subject Field */}
              <div className="bg-[#17171A] border border-[#4F5156] rounded-sm min-w-[720px] w-full">
                <div className="flex justify-between items-center flex-row p-2">
                  <div className="flex flex-row text-[#4F5156] justify-center items-center gap-2">
                    <LuMail />
                    <h2 className="text-sm">Commit Message</h2>
                  </div>
                  <div className="relative">
                    <button
                        disabled={!isGenerated || !subject}
                        onClick={() => copyToClipboard(subject, 'subject')}
                        className="text-[#4F5156] hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 rounded-md cursor-pointer"
                    >
                      {subjectCopied ? <FaCheck /> : <MdOutlineContentCopy />}
                    </button>
                    {showSubjectTooltip && (
                        <div className="absolute -top-10 right-0 bg-[#1B1B1F] text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                          Copied!
                          <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#1B1B1F]"></div>
                        </div>
                    )}
                  </div>
                </div>
                <div className="border-t border-[#4F5156] bg-[#1B1B1F] rounded-b-sm">
                  {isLoading ? (
                      <div className="p-2">
                        <Skeleton className="h-6 w-full" />
                      </div>
                  ) : (
                      <ScrollArea orientation="horizontal" className="w-full">
                          <input
                              type="text"
                              value={subject}
                              onChange={(e) => isGenerated && setSubject(e.target.value)}
                              placeholder={isGenerated ? "Subject will appear here..." : "Generate to see subject..."}
                              className={`w-full p-2 text-sm bg-transparent text-gray-100 focus:outline-none ${
                                  isGenerated ? "focus:ring-1 focus:ring-gray-400 px-1" : "cursor-not-allowed"
                              }`}
                              readOnly={!isGenerated}
                          />
                      </ScrollArea>
                  )}
                </div>
              </div>

              {/* Description Field */}
              <div className="bg-[#17171A] border border-[#4F5156] rounded-sm w-full">
                <div className="flex justify-between items-center flex-row p-2">
                  <div className="flex flex-row text-[#4F5156] justify-center items-center gap-2">
                    <MdOutlineDescription className="w-4.5 h-4.5" />
                    <h2 className="text-sm">Description</h2>
                  </div>
                  <div className="relative">
                    <button
                        disabled={!isGenerated || !description}
                        onClick={() => copyToClipboard(description, 'description')}
                        className="text-[#4F5156] hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 rounded-md cursor-pointer"
                    >
                      {descriptionCopied ? <FaCheck /> : <MdOutlineContentCopy />}
                    </button>
                    {showDescriptionTooltip && (
                        <div className="absolute -top-10 right-0 bg-[#1B1B1F] text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                          Copied!
                          <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#1B1B1F]"></div>
                        </div>
                    )}
                  </div>
                </div>
                <div className="border-t border-[#4F5156] bg-[#1B1B1F] rounded-b-sm">
                  {isLoading ? (
                      <div className="p-2">
                        <Skeleton className="h-32 w-full" />
                      </div>
                  ) : (
                      <ScrollArea orientation="vertical" className="h-[500px] w-full rounded-b-sm">
                        <Textarea
                            value={description}
                            onChange={(e) => isGenerated && setDescription(e.target.value)}
                            placeholder={isGenerated ? "Description will appear here..." : "Generate to see description..."}
                            className={`w-full min-h-[500px] text-sm bg-transparent text-gray-100 focus:ring-none border-none rounded-none resize-none no-scrollbar ${
                                isGenerated ? "" : "cursor-not-allowed"
                            }`}
                            readOnly={!isGenerated}
                        />
                      </ScrollArea>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* File Upload Card */}
              <Card
                  className={`p-8 w-100 border-2 border-dashed rounded-md text-center cursor-pointer ${
                      isDragging
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
                      <p className="text-gray-100 text-sm">
                        Selected: {selectedFile.name}
                      </p>
                  ) : (
                      <p className="text-gray-400 text-sm">
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
                      className="text-[#2251A7] bg-[#091937] border-[#153166] hover:bg-[#081732] hover:text-[#2251A7] cursor-pointer rounded-sm"
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
                    className='w-36 h-10 rounded-sm text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm gradient-btn cursor-pointer'
                    onClick={handleGenerateClick}
                    disabled={!selectedFile || isLoading}
                >
                  {isLoading ? (
                      <CgSpinner className="h-4 w-4 animate-spin-fast" />
                  ) : (
                      <RiSparklingFill className="h-7 w-7" />
                  )}
                  {isLoading ? 'Generating' : 'Generate'}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </>
  );
}