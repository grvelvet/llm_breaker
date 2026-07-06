export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    // Try the modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('Clipboard API failed, falling back to execCommand', err);
  }

  // Fallback for older browsers or when document is not focused (e.g. in iframes)
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Make the textarea invisible
    textArea.style.position = 'fixed';
    textArea.style.top = '-999999px';
    textArea.style.left = '-999999px';
    textArea.style.opacity = '0';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    if (successful) {
      return true;
    } else {
      throw new Error('execCommand failed');
    }
  } catch (err) {
    console.error('Fallback clipboard failed', err);
    return false;
  }
};
