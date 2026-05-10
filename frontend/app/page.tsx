import React from "react";
import Link from "next/link";
import { sdk, STRAPI_URL } from "./utils";
import Image from "next/image";

const getAllPosts = async () => {
  const { data } = await sdk.collection("blogs").find({
    populate: ["banner"],
  });
  return data;
};

export default async function page() {
  const blogPosts = await getAllPosts();
  return (
    <div className="blog-page">
      <h1>Blog Posts</h1>
      <p>
        <i>
          {" "}
          Welcome to a collection of stories from the quieter corners of
          software engineering.
        </i>
      </p>
      <div className="blog-grid">
        {blogPosts.map((post) => (
          <li key={post.documentId} className="blog-card">
            <Image
              src={`${STRAPI_URL}${post.banner.url}`}
              alt={post.title}
              width={400}
              height={180}
            />
            <Link href={`/${post.documentId}`}>{post.title}</Link>
          </li>
        ))}
      </div>
    </div>
  );
}
