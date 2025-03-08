// File: src/App.jsx
import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [streamedResponse, setStreamedResponse] = useState('')
  const [useReranker, setUseReranker] = useState(true)
  const [topK, setTopK] = useState(5)
  const [metaInfo, setMetaInfo] = useState(null)
  const responseRef = useRef(null)
  const abortControllerRef = useRef(null)

  // Auto-scroll to bottom of response container
  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight
    }
  }, [streamedResponse])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!prompt.trim() || isGenerating) return

    try {
      setIsGenerating(true)
      setStreamedResponse('')
      setMetaInfo(null)
      
      abortControllerRef.current = new AbortController()
      
      const response = await fetch('/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          prompt,
          useReranker,
          topK
        }),
        signal: abortControllerRef.current.signal
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n\n').filter(line => line.trim() !== '')
        
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          
          const eventData = JSON.parse(line.substring(6)) 
          
          if (eventData.event === 'meta') {
            setMetaInfo(JSON.parse(eventData.data))
          } 
          else if (eventData.event === 'chunk') {
            setStreamedResponse(prev => prev + eventData.data)
          }
          else if (eventData.event === 'error') {
            console.error('Stream error:', eventData.data.message)
            setStreamedResponse(prev => prev + `\n\nError: ${eventData.data.message}`)
          }
        }
      }
    } catch (error) {
      console.error('Error during generation:', error)
      setStreamedResponse(prev => prev + `\n\nError: ${error.message}`)
    } finally {
      setIsGenerating(false)
      abortControllerRef.current = null
    }
  }

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsGenerating(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Schema Generation Assistant</h1>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="prompt" className="block text-sm font-medium mb-2">
            Describe the database schema you need:
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 min-h-[120px]"
            placeholder="Example: Create a schema for a social media application with users, posts, and comments"
            disabled={isGenerating}
          />
        </div>
        
        <div className="flex flex-wrap gap-6 mb-4">
          <div className="flex items-center">
            <input
              id="useReranker"
              type="checkbox"
              checked={useReranker}
              onChange={(e) => setUseReranker(e.target.checked)}
              className="mr-2"
              disabled={isGenerating}
            />
            <label htmlFor="useReranker" className="text-sm">
              Use reranker
            </label>
          </div>
          
          <div className="flex items-center">
            <label htmlFor="topK" className="text-sm mr-2">
              Top K results:
            </label>
            <input
              id="topK"
              type="number"
              min="1"
              max="20"
              value={topK}
              onChange={(e) => setTopK(parseInt(e.target.value) || 5)}
              className="w-16 p-1 border rounded-md"
              disabled={isGenerating}
            />
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            type="submit"
            className={`px-4 py-2 rounded-md ${
              isGenerating 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Schema'}
          </button>
          
          {isGenerating && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      
      {metaInfo && (
        <div className="mb-4 text-sm text-gray-600 p-3 bg-gray-100 rounded-md">
          <p>Using {metaInfo.contextCount} context documents</p>
          <p>Reranker: {metaInfo.rerankerUsed ? 'Enabled' : 'Disabled'}</p>
        </div>
      )}
      
      <div className="border rounded-md p-4 bg-gray-50">
        <h2 className="text-xl font-semibold mb-3">Generated Schema</h2>
        <div 
          ref={responseRef}
          className="font-mono whitespace-pre-wrap bg-white p-4 border rounded-md max-h-[500px] overflow-y-auto"
        >
          {streamedResponse || (isGenerating ? 'Waiting for response...' : 'Your schema will appear here')}
        </div>
      </div>
    </div>
  )
}

export default App