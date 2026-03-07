export default function isEditorContentValid(content: any) {
  if (!content || !Array.isArray(content.blocks)) return false;

  return content.blocks.some((block: any) => {
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
      return block.data?.items?.length > 0;
    }

    return false;
  });
}
