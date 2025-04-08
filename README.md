# Image Location Annotator

A web application that allows users to extract location data from images and annotate images with that information. The app can either extract EXIF data from uploaded images or use the device's camera to take photos and get the current location.

## Features

- Upload images or take photos directly with your device's camera
- Extract GPS coordinates from image EXIF data
- Get current location using the browser's Geolocation API
- Convert coordinates to address information (postal code, province, district, sub-district)
- Annotate images with location information
- Customize text appearance (size, color, position)
- Download annotated images

## Technologies Used

- React with TypeScript
- Vite for fast development and building
- Material UI for components
- EXIF-JS for extracting image metadata
- OpenStreetMap Nominatim API for geocoding
- Browser APIs (Geolocation, MediaDevices) for location and camera access

## How to Use

1. **Upload an Image or Take a Photo**
   - Choose between uploading an existing image or taking a new photo with your camera
   - If taking a photo, you can also get your current location

2. **Extract or Enter Location Data**
   - The app will try to extract GPS coordinates from the image
   - You can also manually enter location information
   - Get address information from coordinates using the geocoding service

3. **Annotate the Image**
   - Customize how the location information appears on the image
   - Adjust text size, color, and position

4. **Download the Result**
   - Download the annotated image to your device

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

This project is configured for deployment on Vercel. Simply push to the main branch or create a pull request to trigger a deployment.

### Environment Variables

No environment variables are required for basic functionality. The application uses the following external services:

- OpenStreetMap Nominatim API for geocoding (no API key required)
- Browser Geolocation API for getting current location (requires user permission)
- Browser MediaDevices API for camera access (requires user permission)

If you want to use a different geocoding service, you can modify the `geocodingUtils.ts` file.
