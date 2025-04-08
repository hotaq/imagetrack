import { useState } from 'react'
import { Container, Typography, Box, Paper, Tabs, Tab, Button, ThemeProvider, createTheme } from '@mui/material'
import ImageUploader from './components/ImageUploader'
import LocationExtractor from './components/LocationExtractor'
import ImageEditor from './components/ImageEditor'
import CameraCapture from './components/CameraCapture'

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#1976d2',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(to bottom right, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

function App() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [locationData, setLocationData] = useState({
    latitude: '',
    longitude: '',
    postalCode: '',
    province: '',
    district: '',
    subDistrict: ''
  })
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  const [inputMethod, setInputMethod] = useState<'upload' | 'camera'>('upload')

  const handleImageUpload = (file: File) => {
    setUploadedImage(file)
    setImageUrl(URL.createObjectURL(file))
    setStep(2)
  }

  const handleCameraCapture = (file: File, capturedLocationData: any) => {
    setUploadedImage(file)
    setImageUrl(URL.createObjectURL(file))

    // If location data was captured, use it directly and skip to step 3
    if (capturedLocationData.latitude && capturedLocationData.longitude) {
      setLocationData(capturedLocationData)
      setStep(3)
    } else {
      // Otherwise, go to step 2 to manually enter location data
      setStep(2)
    }
  }

  const handleLocationDataUpdate = (data: any) => {
    setLocationData(data)
    setStep(3)
  }

  const handleImageEdit = (editedUrl: string) => {
    setEditedImageUrl(editedUrl)
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: 'upload' | 'camera') => {
    setInputMethod(newValue)
    // Reset to step 1 when changing tabs
    setStep(1)
    setUploadedImage(null)
    setImageUrl(null)
  }

  const handleReset = () => {
    setStep(1)
    setUploadedImage(null)
    setImageUrl(null)
    setLocationData({
      latitude: '',
      longitude: '',
      postalCode: '',
      province: '',
      district: '',
      subDistrict: ''
    })
  }

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md">
        <Box sx={{ my: 6 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            align="center"
            className="gradient-text"
            sx={{ 
              mb: 4,
              fontSize: { xs: '2rem', md: '3rem' },
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            ระบบ.annotator
          </Typography>

          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              mb: 4,
              borderRadius: '16px',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
              }
            }}
          >
            {step === 1 && (
              <>
                <Tabs
                  value={inputMethod}
                  onChange={handleTabChange}
                  centered
                  sx={{ mb: 3 }}
                >
                  <Tab value="upload" label="Upload Image" />
                  <Tab value="camera" label="Take Photo" />
                </Tabs>

                {inputMethod === 'upload' && (
                  <>
                    <Typography variant="h5" gutterBottom>
                      Step 1: Upload an Image
                    </Typography>
                    <ImageUploader onImageUpload={handleImageUpload} />
                  </>
                )}

                {inputMethod === 'camera' && (
                  <>
                    <Typography variant="h5" gutterBottom>
                      Step 1: Take a Photo and Get Location
                    </Typography>
                    <CameraCapture onPhotoCapture={handleCameraCapture} />
                  </>
                )}
              </>
            )}

            {step === 2 && uploadedImage && imageUrl && (
              <>
                <Typography variant="h5" gutterBottom>
                  Step 2: Extract or Enter Location Data
                </Typography>
                <LocationExtractor
                  image={uploadedImage}
                  imageUrl={imageUrl}
                  onLocationDataUpdate={handleLocationDataUpdate}
                />
              </>
            )}

            {step === 3 && uploadedImage && imageUrl && (
              <>
                <Typography variant="h5" gutterBottom>
                  Step 3: Annotate Image
                </Typography>
                <ImageEditor
                  imageUrl={imageUrl}
                  locationData={locationData}
                  onImageEdit={handleImageEdit}
                />
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleReset}
                  >
                    Start Over
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  )
}

export default App



