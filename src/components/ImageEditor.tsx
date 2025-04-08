import { useState, useEffect } from 'react'
import { Box, Button, Typography, Slider, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Paper } from '@mui/material'
import { saveAs } from 'file-saver'

interface ImageEditorProps {
  imageUrl: string
  locationData: {
    latitude: string
    longitude: string
    postalCode: string
    province: string
    district: string
    subDistrict: string
  }
  onImageEdit: (editedUrl: string) => void
}

const ImageEditor = ({ imageUrl, locationData, onImageEdit }: ImageEditorProps) => {
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null)
  const [fontSize, setFontSize] = useState<number>(20)
  const [textColor, setTextColor] = useState<string>('#ffffff')
  const [textPosition, setTextPosition] = useState<string>('bottom')
  // Using underscore prefix to indicate it's used in the component but not directly referenced
  const [_loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    annotateImage()
  }, [fontSize, textColor, textPosition])

  const annotateImage = async () => {
    setLoading(true)

    try {
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.src = imageUrl

      await new Promise((resolve) => {
        img.onload = resolve
      })

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw new Error('Could not get canvas context')
      }

      // Set canvas dimensions to match image
      canvas.width = img.width
      canvas.height = img.height

      // Draw the original image on the canvas
      ctx.drawImage(img, 0, 0)

      // Prepare text to be added
      const locationText = [
        `Lat: ${locationData.latitude}, Long: ${locationData.longitude}`,
        `Postal Code: ${locationData.postalCode}`,
        `Province: ${locationData.province}`,
        `District: ${locationData.district}`,
        `Sub-district: ${locationData.subDistrict}`
      ].filter(line => line.split(': ')[1].trim() !== '')

      // Set text properties
      ctx.font = `${fontSize}px Arial`
      ctx.fillStyle = textColor
      ctx.textAlign = 'left'

      // Add semi-transparent background for text
      // Calculate text dimensions
      const textHeight = fontSize * locationText.length * 1.2
      const padding = 10

      let textX = padding
      let textY

      if (textPosition === 'top') {
        textY = padding + fontSize

        // Draw background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
        ctx.fillRect(0, 0, canvas.width, textHeight + padding * 2)

      } else if (textPosition === 'bottom') {
        textY = canvas.height - textHeight - padding + fontSize

        // Draw background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
        ctx.fillRect(0, canvas.height - textHeight - padding * 2, canvas.width, textHeight + padding * 2)
      }

      // Reset fill style for text
      ctx.fillStyle = textColor

      // Draw text
      locationText.forEach((line, index) => {
        ctx.fillText(line, textX, textY! + index * fontSize * 1.2)
      })

      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL('image/jpeg')
      setEditedImageUrl(dataUrl)
      onImageEdit(dataUrl)

    } catch (error) {
      console.error('ข้อพลาดในการแก้ไขภาพ:', error)
      alert('ไม่สามารถแก้ไขภาพได้')
    } finally {
      setLoading(false)
    }
  }

  const handleFontSizeChange = (_event: Event, value: number | number[]) => {
    setFontSize(value as number)
  }

  const handleTextColorChange = (event: SelectChangeEvent) => {
    setTextColor(event.target.value)
  }

  const handleTextPositionChange = (event: SelectChangeEvent) => {
    setTextPosition(event.target.value)
  }

  const handleDownload = () => {
    if (editedImageUrl) {
      saveAs(editedImageUrl, 'annotated-image.jpg')
    }
  }

  return (
    <Box>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ flex: '1 1 60%', minWidth: '300px' }}>
          <Box
            sx={{
              mb: 3,
              textAlign: 'center',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            }}
          >
            {editedImageUrl ? (
              <img
                src={editedImageUrl}
                alt="Annotated"
                style={{
                  maxWidth: '100%',
                  maxHeight: '500px',
                  display: 'block',
                }}
              />
            ) : (
              <Typography sx={{ p: 4 }}>Processing image...</Typography>
            )}
          </Box>
        </div>

        <div style={{ flex: '1 1 30%', minWidth: '250px' }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '16px',
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                color: 'primary.main',
                fontWeight: 600,
                mb: 3
              }}
            >
              Customize Text
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>Font Size</Typography>
              <Slider
                value={fontSize}
                onChange={handleFontSizeChange}
                min={10}
                max={50}
                step={1}
                marks={[
                  { value: 10, label: '10px' },
                  { value: 30, label: '30px' },
                  { value: 50, label: '50px' }
                ]}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Text Color</InputLabel>
                <Select
                  value={textColor}
                  label="Text Color"
                  onChange={handleTextColorChange}
                >
                  <MenuItem value="#ffffff">White</MenuItem>
                  <MenuItem value="#000000">Black</MenuItem>
                  <MenuItem value="#ff0000">Red</MenuItem>
                  <MenuItem value="#00ff00">Green</MenuItem>
                  <MenuItem value="#0000ff">Blue</MenuItem>
                  <MenuItem value="#ffff00">Yellow</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Text Position</InputLabel>
                <Select
                  value={textPosition}
                  label="Text Position"
                  onChange={handleTextPositionChange}
                >
                  <MenuItem value="top">Top</MenuItem>
                  <MenuItem value="bottom">Bottom</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleDownload}
              disabled={!editedImageUrl}
              sx={{
                mt: 3,
                py: 1.5,
                fontSize: '1.1rem',
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
                }
              }}
            >
              Download Annotated Image
            </Button>
          </Paper>
        </div>
      </div>
    </Box>
  )
}

export default ImageEditor


