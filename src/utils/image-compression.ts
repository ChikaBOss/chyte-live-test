// Safe image compression utility that works with TypeScript

export const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        reject(new Error('Image compression only works in browser environment'));
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (!event.target?.result) {
          reject(new Error('Failed to read file data'));
          return;
        }
        
        // Create image element using window.Image
        const img = new window.Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          const width = img.naturalWidth || img.width;
          const height = img.naturalHeight || img.height;
          
          // Calculate new dimensions
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height, 1);
          const newWidth = Math.round(width * ratio);
          const newHeight = Math.round(height * ratio);
          
          canvas.width = newWidth;
          canvas.height = newHeight;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          // Draw and compress
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, newWidth, newHeight);
          ctx.drawImage(img, 0, 0, newWidth, newHeight);
          
          // Convert to base64
          try {
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
            console.log('✅ Image compressed successfully');
            resolve(compressedDataUrl);
          } catch (error) {
            reject(new Error('Failed to compress image'));
          }
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image for compression'));
        };
        
        img.src = event.target.result as string;
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  };
  
  // Alternative: Use a simpler approach without Image constructor
  export const compressImageSimple = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (!event.target?.result) {
          reject(new Error('Failed to read file'));
          return;
        }
        
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 800;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedDataUrl);
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
        
        img.src = event.target.result as string;
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  };