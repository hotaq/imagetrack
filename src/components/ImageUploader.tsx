import { useState, useRef } from 'react'
import { Box, Button, Typography, Paper } from '@mui/material'

interface ImageUploaderProps {
  onImageUpload: (file: File) => void
}

const ImageUploader = ({ onImageUpload }: ImageUploaderProps) => {
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith('image/')) {
        onImageUpload(file)
      } else {
        alert('Please upload an image file')
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type.startsWith('image/')) {
        onImageUpload(file)
      } else {
        alert('Please upload an image file')
      }
    }
  }

  const onButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click()
    }
  }

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          border: '2px dashed',
          borderColor: dragActive ? 'primary.main' : 'grey.300',
          borderRadius: 4,
          p: 6,
          textAlign: 'center',
          backgroundColor: dragActive ? 'rgba(33, 150, 243, 0.04)' : 'transparent',
          transition: 'all 0.3s ease-in-out',
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'rgba(33, 150, 243, 0.04)',
            transform: 'scale(1.01)',
          }
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        <Typography 
          variant="h5" 
          gutterBottom
          sx={{ 
            color: 'primary.main',
            fontWeight: 600,
            mb: 2
          }}
        >
          ลากและวางภาพนี่
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          หรือ
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          sx={{ 
            px: 4, 
            py: 1.5,
            fontSize: '1.1rem',
            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
            }
          }}
        >
          เลือกไฟล์
        </Button>
        <Typography 
          variant="body2" 
          color="textSecondary" 
          sx={{ mt: 3, opacity: 0.8 }}
        >
          ไฟล์: JPG, PNG, GIF
        </Typography>
      </Paper>
    </Box>
  )
}

export default ImageUploader


