// Format distance to 2 decimal places with unit
export function formatDistance(distance: number, includeUnit = true): string {
  const formattedDistance = distance.toFixed(1);
  return includeUnit ? `${formattedDistance} km` : formattedDistance;
}

// Format time in HH:MM:SS or MM:SS format
export function formatTime(seconds: number, includeHours = false): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (includeHours || hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Format pace as minutes and seconds per kilometer
export function formatPace(secondsPerKm: number): string {
  if (secondsPerKm <= 0) return "-";
  
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.floor(secondsPerKm % 60);
  
  return `${minutes}'${seconds.toString().padStart(2, '0')}"/km`;
}

// Format a date in a readable format
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  const month = d.toLocaleString('default', { month: 'short' });
  const day = d.getDate();
  const year = d.getFullYear();
  return `${month} ${day}, ${year}`;
}

// Format a time in 12-hour format
export function formatTimeOfDay(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', { 
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}
