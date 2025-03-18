class WhiteboardTool {
    static get toolbox() {
      return {
        title: 'Whiteboard',
        icon: '<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="16" height="16" rx="2" fill="none" stroke="currentColor"/><path d="M5 15l5-5 5 5"/></svg>',
      };
    }
  
    constructor({ data, api }) {
      this.data = {
        url: 'https://excalidraw.com', 
        caption: data.caption || 'Whiteboard',
      };
      this.api = api;
      this.wrapper = null;
    }
  
    render() {
      this.wrapper = document.createElement('div');
      this.wrapper.classList.add('whiteboard-tool');
  
      // Iframe with hardcoded URL
      const iframe = document.createElement('iframe');
      iframe.src = this.data.url; // Always https://excalidraw.com
      iframe.width = '100%';
      iframe.height = '400px';
      iframe.frameBorder = '0';
      iframe.allowFullscreen = true;
  
      // Caption input (still editable)
      const captionInput = document.createElement('input');
      captionInput.type = 'text';
      captionInput.placeholder = 'Enter caption (optional)';
      captionInput.value = this.data.caption;
      captionInput.addEventListener('input', (e) => {
        this.data.caption = e.target.value;
      });
  
      this.wrapper.appendChild(iframe);
      this.wrapper.appendChild(captionInput);
  
      // Styling
      this.wrapper.style.padding = '10px';
      this.wrapper.style.border = '1px solid #ddd';
      this.wrapper.style.borderRadius = '4px';
      captionInput.style.width = '100%';
      captionInput.style.marginTop = '5px';
  
      return this.wrapper;
    }
  
    save(blockContent) {
      const captionInput = blockContent.querySelector('input[type="text"]');
      return {
        url: this.data.url, // Always return the hardcoded URL
        caption: captionInput ? captionInput.value || '' : this.data.caption,
      };
    }
  
    static get sanitize() {
      return {
        url: false,
        caption: true,
      };
    }
  }
  
  export default WhiteboardTool;