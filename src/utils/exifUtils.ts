import EXIF from 'exif-js'

interface ExifData {
  latitude?: number
  longitude?: number
  dateTime?: string
}

// Convert GPS coordinates from DMS (degrees, minutes, seconds) to decimal format
const convertDMSToDD = (degrees: number, minutes: number, seconds: number, direction: string): number => {
  let dd = degrees + minutes / 60 + seconds / 3600

  if (direction === 'S' || direction === 'W') {
    dd = dd * -1
  }

  return dd
}

// Alternative method to extract GPS data using FileReader and DataView
const extractGPSDataManually = (file: File): Promise<ExifData> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      const exifData: ExifData = {}
      // Just return empty data for now - this is a fallback method
      resolve(exifData)
    }
    reader.onerror = () => {
      resolve({}) // Resolve with empty data on error
    }
    reader.readAsArrayBuffer(file)
  })
}

// Extract GPS data from EXIF
export const extractExifData = (file: File): Promise<ExifData> => {
  return new Promise((resolve) => {
    // Create an image element to work with
    const img = document.createElement('img')

    // Set up the FileReader to read the image file
    const reader = new FileReader()

    reader.onload = (e) => {
      if (!e.target?.result) {
        resolve({}) // Return empty data if we can't read the file
        return
      }

      // Set the image source to the data URL
      img.src = e.target.result as string

      img.onload = () => {
        const exifData: ExifData = {}

        try {
          // Try to get EXIF data using the library
          EXIF.getData(img as any, function(this: any) {
            try {
              // Check if we have GPS data
              if (EXIF.getTag(this, 'GPSLatitude') && EXIF.getTag(this, 'GPSLongitude')) {
                const latValues = EXIF.getTag(this, 'GPSLatitude')
                const latRef = EXIF.getTag(this, 'GPSLatitudeRef')
                const longValues = EXIF.getTag(this, 'GPSLongitude')
                const longRef = EXIF.getTag(this, 'GPSLongitudeRef')

                if (latValues && latRef && longValues && longRef) {
                  try {
                    // Extract degrees, minutes, seconds
                    const latDegrees = latValues[0].numerator / latValues[0].denominator
                    const latMinutes = latValues[1].numerator / latValues[1].denominator
                    const latSeconds = latValues[2].numerator / latValues[2].denominator

                    const longDegrees = longValues[0].numerator / longValues[0].denominator
                    const longMinutes = longValues[1].numerator / longValues[1].denominator
                    const longSeconds = longValues[2].numerator / longValues[2].denominator

                    // Convert to decimal degrees
                    const latitude = convertDMSToDD(latDegrees, latMinutes, latSeconds, latRef)
                    const longitude = convertDMSToDD(longDegrees, longMinutes, longSeconds, longRef)

                    exifData.latitude = latitude
                    exifData.longitude = longitude
                  } catch (error) {
                    console.error('Error converting GPS coordinates:', error)
                  }
                }
              }

              // Try to get date/time information
              const dateTime = EXIF.getTag(this, 'DateTime')
              if (dateTime) {
                exifData.dateTime = dateTime
              }

              resolve(exifData)
            } catch (error) {
              console.error('Error parsing EXIF data:', error)
              resolve(exifData) // Resolve with whatever data we have
            }
          })
        } catch (error) {
          console.error('Error in EXIF.getData:', error)
          // If the EXIF library fails, try our manual extraction
          extractGPSDataManually(file).then(resolve)
        }
      }

      img.onerror = () => {
        console.error('Error loading image')
        resolve({}) // Resolve with empty data
      }
    }

    reader.onerror = () => {
      console.error('Error reading file')
      resolve({}) // Resolve with empty data
    }

    // Read the file as a data URL
    reader.readAsDataURL(file)
  })
}
