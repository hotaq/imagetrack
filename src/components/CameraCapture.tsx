import { useState, useRef, useEffect } from 'react'
import { Box, Button, Typography, CircularProgress, Alert } from '@mui/material'
import { PhotoCamera, MyLocation } from '@mui/icons-material'

interface CameraCaptureProps {
  onPhotoCapture: (file: File, locationData: any) => void
}

const CameraCapture = ({ onPhotoCapture }: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [locationData, setLocationData] = useState({
    latitude: '',
    longitude: '',
    postalCode: '',
    province: '',
    district: '',
    subDistrict: ''
  })
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)

  // Start camera
  const startCamera = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, // Use back camera if available
        audio: false 
      })
      
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play()
      }
      
      setCameraActive(true)
    } catch (err) {
      console.error('Error accessing camera:', err)
      setError('Could not access camera. Please make sure you have granted camera permissions.')
    } finally {
      setLoading(false)
    }
  }

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
      setCameraActive(false)
    }
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  // Get current location
  const getCurrentLocation = () => {
    setLocationLoading(true)
    setLocationError(null)
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      setLocationLoading(false)
      return
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        
        setLocationData(prev => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString()
        }))
        
        // Try to get address information using reverse geocoding
        fetchAddressFromCoordinates(latitude, longitude)
      },
      (error) => {
        console.error('Error getting location:', error)
        setLocationError('Could not get your current location. Please make sure you have granted location permissions.')
        setLocationLoading(false)
      },
      { enableHighAccuracy: true }
    )
  }

  // Fetch address information from coordinates
  const fetchAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'LocationImageAnnotator/1.0'
          }
        }
      )
      
      const data = await response.json()
      const address = data.address
      
      setLocationData(prev => ({
        ...prev,
        postalCode: address.postcode || '',
        province: address.state || address.province || '',
        district: address.county || address.city || '',
        subDistrict: address.suburb || address.neighbourhood || address.village || ''
      }))
    } catch (error) {
      console.error('Error in reverse geocoding:', error)
    } finally {
      setLocationLoading(false)
    }
  }

  // Capture photo
  const capturePhoto = () => {
    if (!cameraActive) {
      setError('Camera is not active')
      return
    }
    
    const video = videoRef.current
    const canvas = canvasRef.current
    
    if (!video || !canvas) return
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Draw the current video frame on the canvas
    const context = canvas.getContext('2d')
    if (!context) return
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // Convert canvas to data URL
    const dataUrl = canvas.toDataURL('image/jpeg')
    setCapturedImage(dataUrl)
    
    // Convert data URL to File object
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' })
        
        // If we have location data, pass it along with the file
        if (locationData.latitude && locationData.longitude) {
          onPhotoCapture(file, locationData)
        } else {
          // If no location data, just pass the file
          onPhotoCapture(file, {
            latitude: '',
            longitude: '',
            postalCode: '',
            province: '',
            district: '',
            subDistrict: ''
          })
        }
      }
    }, 'image/jpeg')
    
    // Stop the camera after capturing
    stopCamera()
  }

  return (
    <Box>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* Camera preview or captured image */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '500px', margin: '0 auto' }}>
          {!capturedImage ? (
            <video 
              ref={videoRef} 
              style={{ 
                width: '100%', 
                maxHeight: '400px', 
                backgroundColor: '#000',
                display: cameraActive ? 'block' : 'none'
              }}
              autoPlay 
              playsInline 
              muted
            />
          ) : (
            <img 
              src={capturedImage} 
              alt="Captured" 
              style={{ width: '100%', maxHeight: '400px' }} 
            />
          )}
          
          {/* Hidden canvas for capturing */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          {/* Loading indicator */}
          {loading && (
            <div style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'rgba(0,0,0,0.5)',
              padding: '20px',
              borderRadius: '10px'
            }}>
              <CircularProgress color="primary" />
            </div>
          )}
        </div>
        
        {/* Error messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* Camera controls */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          {!cameraActive && !capturedImage ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<PhotoCamera />}
              onClick={startCamera}
              disabled={loading}
            >
              Start Camera
            </Button>
          ) : cameraActive && !capturedImage ? (
            <Button
              variant="contained"
              color="primary"
              onClick={capturePhoto}
              disabled={loading}
            >
              Capture Photo
            </Button>
          ) : null}
          
          {cameraActive && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={stopCamera}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
        </div>
        
        {/* Location section */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Location Information
          </Typography>
          
          {locationError && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {locationError}
            </Alert>
          )}
          
          <Button
            variant="outlined"
            color="primary"
            startIcon={<MyLocation />}
            onClick={getCurrentLocation}
            disabled={locationLoading}
            fullWidth
            sx={{ mb: 2 }}
          >
            {locationLoading ? 'Getting Location...' : 'Get Current Location'}
          </Button>
          
          {locationLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
          
          {locationData.latitude && locationData.longitude && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2">
                Latitude: {locationData.latitude}
              </Typography>
              <Typography variant="body2">
                Longitude: {locationData.longitude}
              </Typography>
              {locationData.postalCode && (
                <Typography variant="body2">
                  Postal Code: {locationData.postalCode}
                </Typography>
              )}
              {locationData.province && (
                <Typography variant="body2">
                  Province: {locationData.province}
                </Typography>
              )}
              {locationData.district && (
                <Typography variant="body2">
                  District: {locationData.district}
                </Typography>
              )}
              {locationData.subDistrict && (
                <Typography variant="body2">
                  Sub-district: {locationData.subDistrict}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </div>
    </Box>
  )
}

export default CameraCapture
