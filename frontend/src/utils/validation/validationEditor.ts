interface EditorBlock {
  type: string;
  data?: {
    text?: string;
    file?: { url: string };
    items?: unknown[];
  };
}

interface EditorContent {
  blocks: EditorBlock[];
}

export default function isEditorContentValid(content: EditorContent) {
  if (!content || !Array.isArray(content.blocks)) return false;

  return content.blocks.some((block: EditorBlock) => {
    // Text
    if (block.type === 'paragraph' || block.type === 'header') {
      return block.data?.text?.trim();
    }

    // Image
    if (block.type === 'image') {
      return block.data?.file?.url;
    }

    // List
    if (block.type === 'list') {
      return (block.data?.items?.length ?? 0) > 0;
    }

    return false;
  });
}
