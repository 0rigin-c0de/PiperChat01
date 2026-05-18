import { useEffect, useRef } from 'react';

/**
 * Custom hook to manage smart scrolling behavior in chat windows
 * 
 * Features:
 * - Auto-scrolls to bottom only when user is already at bottom
 * - Prevents scroll jumping when user is reading history
 * - Detects user scroll activity with debouncing
 * 
 * Usage:
 * const { scrollContainerRef, autoScroll, handleScroll } = useSmartScroll();
 * 
 * Then attach to your scrollable container:
 * <div ref={scrollContainerRef} onScroll={handleScroll}>
 *   {messages}
 * </div>
 * 
 * Call autoScroll() whenever new messages arrive or content changes
 */
export const useSmartScroll = () => {
  const scrollContainerRef = useRef(null);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

  /**
   * Check if user is scrolled to the bottom of the container
   * Uses a 50px threshold to account for rounding and small variations
   * 
   * @returns {boolean} True if user is at or near the bottom
   */
  const isScrolledToBottom = () => {
    if (!scrollContainerRef.current) return false;
    
    const { scrollHeight, scrollTop, clientHeight } = scrollContainerRef.current;
    const threshold = 50; // pixels from bottom (tolerance)
    
    // User is at bottom if: total height - current scroll - visible height < threshold
    return scrollHeight - scrollTop - clientHeight < threshold;
  };

  /**
   * Smoothly scroll to the bottom of the container
   * Uses smooth behavior for better UX
   */
  const scrollToBottom = () => {
    if (!scrollContainerRef.current) return;
    
    // Use smooth scrolling for better UX
    scrollContainerRef.current.scrollTo({
      top: scrollContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  /**
   * Handle scroll events to detect active user scrolling
   * Sets a debounce timer to determine when user stops scrolling
   * 
   * This prevents auto-scroll from interfering while user is manually scrolling
   */
  const handleScroll = () => {
    // Mark that user is actively scrolling
    isUserScrollingRef.current = true;

    // Clear any existing debounce timer
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // After 150ms of scroll inactivity, mark as done scrolling
    // This prevents false positives from scroll momentum on mobile
    scrollTimeoutRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 150);
  };

  /**
   * Intelligent auto-scroll logic
   * 
   * Only scrolls if:
   * 1. User is NOT currently manually scrolling
   * 2. User WAS already at the bottom (has permission to scroll)
   * 
   * This is called whenever new messages arrive
   * 
   * @example
   * // When new message received from socket
   * setTimeout(() => autoScroll(), 0);
   */
  const autoScroll = () => {
    // Don't interrupt if user is actively scrolling
    if (isUserScrollingRef.current) return;

    // Only scroll if user was already viewing the bottom
    // This respects the user's choice to read history
    if (isScrolledToBottom()) {
      scrollToBottom();
    }
  };

  /**
   * Cleanup: Remove scroll timeout on unmount to prevent memory leaks
   */
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    scrollContainerRef,      // Ref to attach to your scrollable container
    autoScroll,              // Function to call when messages update
    isScrolledToBottom,      // Utility function to check scroll position
    scrollToBottom,          // Manual scroll to bottom function
    handleScroll,            // Attach to onScroll event
  };
};