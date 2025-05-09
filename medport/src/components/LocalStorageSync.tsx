import { useEffect } from 'react';

// This component provides an alternative synchronization method using localStorage
// It's useful for browsers that don't support BroadcastChannel API
const LocalStorageSync: React.FC<{ onDataChange: () => void }> = ({ onDataChange }) => {
  useEffect(() => {
    // Function to handle storage events
    const handleStorageChange = (event: StorageEvent) => {
      // Only respond to our specific key
      if (event.key === 'medport_data_change') {
        console.log('LocalStorage change detected:', event.newValue);
        onDataChange();
      }
    };

    // Add event listener
    window.addEventListener('storage', handleStorageChange);

    // Clean up
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [onDataChange]);

  return null; // This component doesn't render anything
};

// Helper function to notify other tabs about data changes
export const notifyTabsViaLocalStorage = () => {
  try {
    localStorage.setItem('medport_data_change', Date.now().toString());
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
};

export default LocalStorageSync;