import axios from 'axios'

interface AddressData {
  postalCode: string
  province: string
  district: string
  subDistrict: string
}

// Use OpenStreetMap Nominatim API for reverse geocoding
export const reverseGeocode = async (latitude: number, longitude: number): Promise<AddressData> => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'LocationImageAnnotator/1.0'
        }
      }
    )
    
    const address = response.data.address
    
    return {
      postalCode: address.postcode || '',
      province: address.state || address.province || '',
      district: address.county || address.city || '',
      subDistrict: address.suburb || address.neighbourhood || address.village || ''
    }
  } catch (error) {
    console.error('Error in reverse geocoding:', error)
    return {
      postalCode: '',
      province: '',
      district: '',
      subDistrict: ''
    }
  }
}
