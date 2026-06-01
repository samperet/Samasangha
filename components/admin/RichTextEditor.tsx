"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

const ToolbarButton = ({
  onClick,
  active,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "px-2 py-1 rounded text-sm font-medium transition-colors",
      active ? "bg-[#1a2744] text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
    )}
  >
    {children}
  </button>
);

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write something...",
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "tiptap prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4",
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value]);

  if (!editor) return null;

  function addImage() {
    const url = prompt("Image URL:");
    if (url) editor?.chain().focus().setImage({ src: url }).run();
  }

  function setLink() {
    const url = prompt("Link URL:");
    if (url) editor?.chain().focus().setLink({ href: url }).run();
    else editor?.chain().focus().unsetLink().run();
  }

  return (
    <div className={cn("border border-gray-300 rounded overflow-hidden", className)}>
      <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
          B
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
          I
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}>
          H2
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}>
          H3
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
          UL
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
          OL
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>
          &ldquo;&rdquo;
        </ToolbarButton>
        <ToolbarButton onClick={setLink} active={editor.isActive("link")}>
          Link
        </ToolbarButton>
        <ToolbarButton onClick={addImage}>Img</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()}>↩</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()}>↪</ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
