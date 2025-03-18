import React, { useEffect, useRef, useState } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import Delimiter from '@editorjs/delimiter';
import Alert from 'editorjs-alert';
import List from "@editorjs/list";
import Checklist from '@editorjs/checklist';
import Table from '@editorjs/table';
import { doc, onSnapshot, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useUser } from '@clerk/nextjs';
import Paragraph from '@editorjs/paragraph';
import GenerateAITemplate from './GenerateAITemplate';
import { useMyPresence } from '@liveblocks/react';
import WhiteboardTool from './WhiteboardTool';
import MermaidTool from 'editorjs-mermaid';
import CodeBox from '@bomdi/codebox';
import InlineCode from '@editorjs/inline-code';
import Undo from 'editorjs-undo';

// Custom SimpleImage Tool with disappearing input
class CustomSimpleImage {
  static get toolbox() {
    return {
      title: 'Image',
      icon: '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30zm0 52l-43-30-56 30-81-67-66 39v23c0 19 15 34 34 34h178c17 0 31-13 34-29zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"/></svg>'
    };
  }

  constructor({ data }) {
    this.data = data || {};
    this.wrapper = null;
  }

  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('custom-image-tool');

    if (this.data.url) {
      this._renderImage();
    } else {
      this._renderInput();
    }

    return this.wrapper;
  }

  _renderInput() {
    this.wrapper.innerHTML = '';

    const label = document.createElement('label');
    label.innerText = 'Upload via URL';
    label.classList.add('custom-image-label');

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Paste image URL here...';
    input.value = this.data.url || '';
    input.classList.add('custom-image-input');

    input.addEventListener('input', (event) => {
      const url = event.target.value.trim();
      this.data.url = url;
      if (url) {
        this._renderImage();
      }
    });

    this.wrapper.appendChild(label);
    this.wrapper.appendChild(input);
  }

  _renderImage() {
    this.wrapper.innerHTML = '';

    const img = document.createElement('img');
    img.src = this.data.url;
    img.style.maxWidth = '100%';
    img.style.cursor = 'pointer';
    img.alt = 'Uploaded image';

    img.addEventListener('click', () => {
      this._renderInput();
    });

    this.wrapper.appendChild(img);
  }

  save(blockContent) {
    return {
      url: this.data.url || blockContent.querySelector('input')?.value || ''
    };
  }
}

// Custom Embed Tool with inline input
class EmbedTool {
  static get toolbox() {
    return {
      title: 'Embed',
      icon: '<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 1.6a8.4 8.4 0 100 16.8 8.4 8.4 0 000-16.8zm4.789 12.361L13.05 15.1a.5.5 0 01-.7-.061L7.639 9.55a.5.5 0 01.06-.7L9.35 7.1a.5.5 0 01.7.06l4.711 5.489a.5.5 0 01-.06.7z"/></svg>'
    };
  }

  constructor({ data, api }) {
    this.api = api;
    this.data = data || {};
    this.wrapper = null;
  }

  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('custom-embed-tool');

    if (this.data.url) {
      this._renderEmbed();
    } else {
      this._renderInput();
    }

    return this.wrapper;
  }

  _renderInput() {
    this.wrapper.innerHTML = '';

    const label = document.createElement('label');
    label.innerText = 'Embed URL';
    label.classList.add('custom-embed-label');

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Paste embed URL (YouTube, Canva, etc.)...';
    input.value = this.data.url || '';
    input.classList.add('custom-embed-input');

    input.addEventListener('input', (event) => {
      const url = event.target.value.trim();
      this.data.url = url;
      if (url) {
        this._renderEmbed();
      }
    });

    this.wrapper.appendChild(label);
    this.wrapper.appendChild(input);
  }

  _renderEmbed() {
    this.wrapper.innerHTML = '';

    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    const canvaRegex = /^(https?:\/\/)?(www\.)?canva\.com\/design\/.+/;

    let embedUrl = this.data.url;
    if (youtubeRegex.test(this.data.url)) {
      const videoId = this.data.url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
    } else if (canvaRegex.test(this.data.url)) {
      embedUrl = this.normalizeCanvaUrl(this.data.url);
    }

    const iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.width = '100%';
    iframe.height = '400';
    iframe.frameBorder = '0';
    iframe.allowFullscreen = true;
    iframe.style.cursor = 'pointer';
    iframe.title = 'Embedded Content';

    iframe.addEventListener('click', () => {
      this._renderInput();
    });

    this.wrapper.appendChild(iframe);
  }

  normalizeCanvaUrl(url) {
    if (url.includes('/edit')) {
      return url.replace('/edit', '/view?embed');
    } else if (url.includes('/view') && !url.includes('?embed')) {
      return url + '?embed';
    }
    return url;
  }

  save() {
    return {
      url: this.data.url || ''
    };
  }

  static get isReadOnlySupported() {
    return true;
  }
}

// Inject styles for both tools
const injectStyles = () => {
  const styles = `
    .custom-image-tool, .custom-embed-tool {
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: #f9f9f9;
      margin: 10px 0;
    }
    .custom-image-label, .custom-embed-label {
      display: block;
      font-weight: bold;
      margin-bottom: 5px;
      color: #333;
    }
    .custom-image-input, .custom-embed-input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 3px;
      box-sizing: border-box;
    }
  `;
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
};

function RichDocumentEditor({ params }) {
  const editorRef = useRef(null);
  const { user } = useUser();
  const [editorData, setEditorData] = useState(null);
  const [myPresence, updateMyPresence] = useMyPresence();

  useEffect(() => {
    if (user) {
      updateMyPresence({
        name: user.fullName,
        avatar: user.profileImageUrl,
      });
      fetchInitialData();
    }
  }, [user, updateMyPresence]);

  const fetchInitialData = async () => {
    const docRef = doc(db, 'documentOutput', params?.documentid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const output = docSnap.data().output || '{}';
      try {
        const data = JSON.parse(output);
        setEditorData(data);
        InitEditor(data);
      } catch (error) {
        console.error("Error parsing JSON:", error);
        InitEditor();
      }
    } else {
      await setDoc(docRef, { output: '{}' });
      InitEditor();
    }

    listenToFirebaseUpdates();
  };

  const SaveDocument = async () => {
    if (!editorRef.current) {
      console.warn('Editor is not initialized yet');
      return;
    }

    try {
      const outputData = await editorRef.current.save();
      console.log('Editor save output:', outputData);

      if (!outputData || !outputData.blocks || !Array.isArray(outputData.blocks)) {
        console.warn('Editor save returned invalid or empty data:', outputData);
        const fallbackData = { blocks: [] };
        const docRef = doc(db, 'documentOutput', params?.documentid);
        await updateDoc(docRef, {
          output: JSON.stringify(fallbackData),
          editedBy: user?.primaryEmailAddress?.emailAddress,
        });
        setEditorData(fallbackData);
        return;
      }

      if (JSON.stringify(outputData) === JSON.stringify(editorData)) {
        return;
      }

      const docRef = doc(db, 'documentOutput', params?.documentid);
      await updateDoc(docRef, {
        output: JSON.stringify(outputData),
        editedBy: user?.primaryEmailAddress?.emailAddress,
      });

      setEditorData(outputData);
    } catch (error) {
      console.error('Error saving document:', error);
    }
  };

  const listenToFirebaseUpdates = () => {
    const unsubscribe = onSnapshot(doc(db, 'documentOutput', params?.documentid), (docSnap) => {
      if (!docSnap.exists()) return;

      const output = docSnap.data().output || '{}';
      try {
        const data = JSON.parse(output);
        if (docSnap.data()?.editedBy !== user?.primaryEmailAddress?.emailAddress) {
          updateEditorContent(data);
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    });

    return () => unsubscribe();
  };

  const InitEditor = (initialData = null) => {
    if (editorRef.current) return;

    injectStyles();

    const editor = new EditorJS({
      holder: 'editorjs',
      tools: {
        header: Header,
        delimiter: Delimiter,
        paragraph: {
          class: Paragraph,
          inlineToolbar: true,
        },
        embed: EmbedTool,
        alert: {
          class: Alert,
          inlineToolbar: true,
          shortcut: 'CMD+SHIFT+A',
          config: {
            alertTypes: ['primary', 'secondary', 'info', 'success', 'warning', 'danger', 'light', 'dark'],
            defaultType: 'primary',
            messagePlaceholder: 'Enter something',
          },
        },
        table: Table,
        list: {
          class: List,
          inlineToolbar: true,
          shortcut: 'CMD+SHIFT+L',
          config: { defaultStyle: 'unordered' },
        },
        checklist: { class: Checklist, shortcut: 'CMD+SHIFT+C', inlineToolbar: true },
        image: CustomSimpleImage,
        whiteboard: WhiteboardTool,
        mermaid: MermaidTool,
        codeBox: {
          class: CodeBox,
          shortcut: 'CMD+SHIFT+P',
          config: {
            themeName: 'atom-one-light',
            useDefaultTheme: 'light'
          }
        },
        inlineCode: {
          class: InlineCode,
          shortcut: 'CMD+SHIFT+M',
        },
      },
      data: initialData || { blocks: [] },
      onReady: () => {
        editorRef.current = editor;
        MermaidTool.config({ theme: 'light' });
        new Undo({ editor });
      },
      onChange: async (api, event) => {
        const blockCount = api.blocks.getBlocksCount();
        if (blockCount > 0) {
          const lastBlockIndex = blockCount - 1;
          const lastBlock = await api.blocks.getBlockByIndex(lastBlockIndex);
          if (lastBlock && lastBlock.type === 'paragraph') {
            const content = await api.blocks.getBlockByIndex(lastBlockIndex).save();
            const text = content?.data?.text || '';
            const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;
            if (urlRegex.test(text.trim()) && text.trim().length > 0) {
              setPastedUrl(text.trim());
              setPastePosition(lastBlockIndex);
              setShowPastePrompt(true);
            }
          }
        }
        SaveDocument();
      },
    });
  };

  const updateEditorContent = (data) => {
    if (!editorRef.current || !data || !data.blocks) return;

    editorRef.current.isReady.then(() => {
      editorRef.current.render(data);
    }).catch((err) => console.error("Error rendering document:", err));
  };

  return (
    <div>
      <div id="editorjs" className="w-[70%]"></div>
      <div className='no-print'>
      <div className="fixed bottom-10 md:ml-80 left-0 z-10">
        <GenerateAITemplate setGenerateAIOutput={(output) => editorRef.current?.render(output)} />
      </div>
      </div>
    </div>
  );
}

export default RichDocumentEditor;