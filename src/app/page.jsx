'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { FaUpload, FaMagic, FaCopy, FaSpinner, FaCheck } from 'react-icons/fa'

export default function Home() {
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [subjectCopied, setSubjectCopied] = useState(false)
  const [descriptionCopied, setDescriptionCopied] = useState(false)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && (file.type === 'text/plain' || file.name.endsWith('.diff'))) {
      setSelectedFile(file)
      setSubject('')
      setDescription('')
    } else {
      console.error("Invalid file type. Please upload a .txt or .diff file.")
      setSelectedFile(null)
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file && (file.type === 'text/plain' || file.name.endsWith('.diff'))) {
      setSelectedFile(file)
      setSubject('')
      setDescription('')
    } else {
      console.error("Invalid file type. Please upload a .txt or .diff file.")
      setSelectedFile(null)
      e.target.value = null
    }
  }

  const handleGenerateClick = async () => {
    if (!selectedFile || isLoading) {
      return
    }
    
    setIsLoading(true)
    setSubject('')
    setDescription('')
    setSubjectCopied(false)
    setDescriptionCopied(false)
    
    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await axios.post('/api/process', formData)
      const data = response.data
      setSubject(data.subject || '')
      setDescription(data.description || '')
    } catch (error) {
      console.error('Error processing file:', error)
      setSubject('Error')
      setDescription(error.response?.data?.description || error.message || 'An error occurred during processing.')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'subject') {
        setSubjectCopied(true)
        setTimeout(() => setSubjectCopied(false), 2000)
      } else if (type === 'description') {
        setDescriptionCopied(true)
        setTimeout(() => setDescriptionCopied(false), 2000)
      }
    }).catch(err => {
      console.error('Failed to copy text: ', err)
    })
  }

  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className={`p-8 border-2 border-dashed ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        } rounded-lg text-center cursor-pointer`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            {selectedFile ? (
              <p className="text-gray-700 font-medium">Selected: {selectedFile.name}</p>
            ) : (
              <p className="text-gray-600">Drag and drop your diff file here, or</p>
            )}
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              id="fileInput"
              accept=".txt,.diff"
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

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="subject-textarea" className="text-sm font-medium text-gray-700">Subject</label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(subject, 'subject')}
                className={`text-blue-500 hover:text-blue-600 flex items-center transition-all duration-150 ${subjectCopied ? 'bg-green-100 text-green-700' : ''}`}
                disabled={!subject || isLoading || subjectCopied}
              >
                {subjectCopied ? (
                  <FaCheck className="mr-1 h-3 w-3" />
                ) : (
                  <FaCopy className="mr-1 h-3 w-3" />
                )}
                {subjectCopied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            {isLoading ? (
              <Skeleton className="h-[100px] w-full bg-gray-300" />
            ) : (
              <Textarea
                id="subject-textarea"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="min-h-[100px] bg-gray-800 text-white focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Generated subject will appear here..."
              />
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="description-textarea" className="text-sm font-medium text-gray-700">Description</label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(description, 'description')}
                className={`text-blue-500 hover:text-blue-600 flex items-center transition-all duration-150 ${descriptionCopied ? 'bg-green-100 text-green-700' : ''}`}
                disabled={!description || isLoading || descriptionCopied}
              >
                {descriptionCopied ? (
                  <FaCheck className="mr-1 h-3 w-3" />
                ) : (
                  <FaCopy className="mr-1 h-3 w-3" />
                )}
                {descriptionCopied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            {isLoading ? (
              <Skeleton className="h-[200px] w-full bg-gray-300" />
            ) : (
              <Textarea
                id="description-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[200px] bg-gray-800 text-white focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Generated description will appear here..."
              />
            )}
          </div>
        </div>
      </div>
    </main>
  )
} 