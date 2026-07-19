/**
 * Presentation control port (PowerPoint / Keynote — future).
 */
export interface PresentationActionPort {
  nextSlide: () => Promise<void>
  previousSlide: () => Promise<void>
  startSlideshow: () => Promise<void>
  exitSlideshow: () => Promise<void>
}
