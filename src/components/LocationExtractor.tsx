import { useState } from 'react'
import { Box, TextField, Button, Typography, CircularProgress, Alert } from '@mui/material'
import { extractExifData } from '../utils/exifUtils'
import { reverseGeocode } from '../utils/geocodingUtils'

interface LocationExtractorProps {
  image: File
  imageUrl: string
  onLocationDataUpdate: (data: any) => void
}

const LocationExtractor = ({ image, imageUrl, onLocationDataUpdate }: LocationExtractorProps) => {
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [locationData, setLocationData] = useState({
    latitude: '',
    longitude: '',
    postalCode: '',
    province: '',
    district: '',
    subDistrict: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLocationData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleExtractLocation = async () => {
    setExtracting(true)
    setError(null)

    try {
      const exifData = await extractExifData(image)

      if (exifData.latitude !== undefined && exifData.longitude !== undefined) {
        const lat = exifData.latitude
        const lng = exifData.longitude
        setLocationData(prev => ({
          ...prev,
          latitude: lat.toString(),
          longitude: lng.toString()
        }))

        // Try to get address information from coordinates
        setLoading(true)
        try {
          const addressData = await reverseGeocode(lat, lng)
          setLocationData(prev => ({
            ...prev,
            ...addressData
          }))
        } catch (error) {
          console.error('Error getting address data:', error)
          setError('Could not retrieve address information from coordinates. You can enter it manually.')
        } finally {
          setLoading(false)
        }
      } else {
        setError('No GPS data found in this image. You can enter location information manually.')
      }
    } catch (error) {
      console.error('Error extracting EXIF data:', error)
      setError('Failed to extract location data from image. You can enter it manually.')
    } finally {
      setExtracting(false)
    }
  }

  const handleGetAddressFromCoordinates = async () => {
    if (!locationData.latitude || !locationData.longitude) {
      setError('Please enter both latitude and longitude to get address information')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const lat = parseFloat(locationData.latitude)
      const lng = parseFloat(locationData.longitude)

      if (isNaN(lat) || isNaN(lng)) {
        throw new Error('Invalid coordinates')
      }

      const addressData = await reverseGeocode(lat, lng)
      setLocationData(prev => ({
        ...prev,
        ...addressData
      }))
    } catch (error) {
      console.error('Error getting address data:', error)
      setError('Could not retrieve address information from coordinates. Please enter it manually.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = () => {
    onLocationDataUpdate(locationData)
  }

  return (
    <Box>
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <Box sx={{ mb: 2 }}>
            <img
              src={imageUrl}
              alt="Uploaded"
              style={{ maxWidth: '100%', maxHeight: '300px', display: 'block', margin: '0 auto' }}
            />
          </Box>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            onClick={handleExtractLocation}
            disabled={extracting}
            startIcon={extracting ? <CircularProgress size={20} /> : null}
          >
            {extracting ? 'Extracting...' : 'Extract Location from Image'}
          </Button>
        </div>

        <div style={{ flex: '1', minWidth: '300px' }}>
          <Typography variant="subtitle1" gutterBottom>
            Location Information
          </Typography>

          {error && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <TextField
                  label="Latitude"
                  name="latitude"
                  value={locationData.latitude}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Longitude"
                  name="longitude"
                  value={locationData.longitude}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                />
              </div>

              {(locationData.latitude && locationData.longitude) && (
                <Box sx={{ mt: 1, mb: 2 }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleGetAddressFromCoordinates}
                    disabled={loading}
                    size="small"
                    fullWidth
                  >
                    Get Address from Coordinates
                  </Button>
                </Box>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <TextField
                  label="Postal Code"
                  name="postalCode"
                  value={locationData.postalCode}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  style={{ flex: '1', minWidth: '45%' }}
                />
                <TextField
                  label="Province"
                  name="province"
                  value={locationData.province}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  style={{ flex: '1', minWidth: '45%' }}
                />
                <TextField
                  label="District"
                  name="district"
                  value={locationData.district}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  style={{ flex: '1', minWidth: '45%' }}
                />
                <TextField
                  label="Sub-district"
                  name="subDistrict"
                  value={locationData.subDistrict}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  style={{ flex: '1', minWidth: '45%' }}
                />
              </div>
            </>
          )}

          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSubmit}
              disabled={!locationData.latitude || !locationData.longitude}
            >
              Continue
            </Button>
          </Box>
        </div>
      </div>
    </Box>
  )
}

export default LocationExtractor
