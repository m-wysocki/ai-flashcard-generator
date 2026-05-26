import "@testing-library/jest-dom";

// Radix UI uses pointer capture APIs not available in JSDOM
window.HTMLElement.prototype.hasPointerCapture = jest.fn();
window.HTMLElement.prototype.setPointerCapture = jest.fn();
window.HTMLElement.prototype.releasePointerCapture = jest.fn();
window.HTMLElement.prototype.scrollIntoView = jest.fn();
