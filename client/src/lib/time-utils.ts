/**
 * Convert a date string to a relative time format (e.g., "2 days ago", "3 hours ago")
 */
export function getRelativeTime(dateString: string | undefined): string {
  if (!dateString) return "";
  
  try {
    // Parse the date string
    const date = new Date(dateString);
    const now = new Date();
    
    // Get the difference in milliseconds
    const diffMs = now.getTime() - date.getTime();
    
    // Convert to different units
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    
    // Return appropriate format
    if (diffSeconds < 60) {
      return "Just now";
    } else if (diffMinutes < 60) {
      return diffMinutes === 1 ? "1 minute ago" : `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
    } else if (diffWeeks < 4) {
      return diffWeeks === 1 ? "1 week ago" : `${diffWeeks} weeks ago`;
    } else if (diffMonths < 12) {
      return diffMonths === 1 ? "1 month ago" : `${diffMonths} months ago`;
    } else {
      // For older posts, show the actual date
      return date.toLocaleDateString();
    }
  } catch (error) {
    console.error("Error parsing date:", error);
    return "";
  }
}