import React, { createContext, useContext, useState } from 'react'

const DocumentContext = createContext()

export function DocumentProvider({ children }) {
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [extractedText, setExtractedText] = useState('')

  const addUploadedFile = (file) => {
    setUploadedFiles((prev) => [file, ...prev])
  }

  const removeUploadedFile = (fileId) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  return (
    <DocumentContext.Provider
      value={{
        uploadedFiles,
        extractedText,
        setExtractedText,
        addUploadedFile,
        removeUploadedFile,
      }}
    >
      {children}
    </DocumentContext.Provider>
  )
}

export function useDocument() {
  return useContext(DocumentContext)
}
