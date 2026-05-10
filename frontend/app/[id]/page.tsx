"use client";

import { use, useEffect, useState } from "react";
import { sdk, fixImageUrls, STRAPI_URL } from "../utils";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Image } from "@tiptap/extension-image";

import NextImage from "next/image";

export default function page(props: PageProps<"/id">) {
  const { id } = use(props.params);
  const [post, setPost] = useState<{
    title: string;
    banner: string;
    content: any;
  } | null>(null);

  useEffect(() => {
    const fetchSinglePost = async () => {
      const articles = sdk.collection("blogs");
      const { data } = await articles.findOne(`${id}`, {
        populate: ["banner"],
      });

      const parsed = JSON.parse(data.content);
      setPost({
        title: data.title,
        banner: data.banner.url,
        content: fixImageUrls(parsed),
      });
    };

    fetchSinglePost();
  }, [id]);

  const editor = useEditor(
    {
      extensions: [StarterKit, Table, TableRow, TableCell, TableHeader, Image],
      content: post?.content,
      editable: false,
      immediatelyRender: false,
    },
    [post?.content],
  );

  return (
    <div className="tiptap-content">
      <h1>{post?.title}</h1>
      {post?.banner && (
        <NextImage
          src={`${STRAPI_URL}${post?.banner}`}
          alt={post.title ?? ""}
          width={1280}
          height={720}
        />
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
