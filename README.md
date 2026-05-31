Strapi's built-in rich text editor works for basic content. But when your team needs a more polished editing experience — tables, task lists, preset-based toolbars, and fine-grained control — TipTap is the upgrade worth making.

**TL;DR**

- Install the `@notum-cz/strapi-plugin-tiptap-editor` plugin and configure named toolbar presets (minimal, standard, full) in `config/plugins.ts` — each feature must be explicitly set to `true` to appear in the editor.
- Create a **Blog** collection type in Strapi with a `title` (short text), `banner` (single media), and `content` (Rich Text TipTap) field, assigning your chosen preset via the Advanced Settings tab in the Content-Type Builder.
- Enable `find` and `findOne` API permissions for the Blog collection and upload folder under **Settings → Roles → Public**, otherwise your frontend will get a 403.
- Set up a Next.js frontend, install the TipTap extensions and Strapi client, and create a `utils.tsx` file that exports the SDK, base URL, and a `fixImageUrls` helper that rewrites relative image paths to full Strapi URLs.
- Fetch all posts on the listing page using a server component, and render individual posts using `useEditor` with `editable: false` — passing the parsed ProseMirror JSON from `JSON.parse(data.content)` as the editor content.

## What is TipTap
[TipTap](https://tiptap.dev/) is an open-source, headless, ProseMirror-based rich text editor framework known for its extensibility and developer-friendly API. Mention that it powers editors across popular tools and is used by thousands of teams who need fine-grained control over the editing experience.

## Video Resource
Below is the video tutorial for this integration. Skip if you prefer the written integration.

<iframe width="560" height="315" src="https://www.youtube.com/embed/cz3O2u3NeYk" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Why Use TipTap with Strapi?
Strapi's default rich text editor covers basic needs, but teams building content-heavy products often need more. 
 
Here's what TipTap adds to the equation.

1. Modern editing experience — Editors get a familiar, Word-like WYSIWYG with a clean toolbar, keyboard shortcuts, and inline controls.
2. Preset-based configuration — Developers define named toolbar presets (e.g., minimal, standard, full) and assign them per field in the Content-Type Builder — no custom UI code needed.
3. Deep content capabilities — Tables, task lists, headings with independent SEO tags, code blocks with syntax highlighting, text alignment, and image management via the Strapi Media Library.
4. Frontend-ready JSON output — Content is stored as ProseMirror JSON and rendered to HTML using @tiptap/html — integrates cleanly with any frontend.

## TipTap Key Features
1. Rich text formatting — Bold, italic, underline, strikethrough, inline code, superscript, subscript — all with keyboard shortcuts.
2. Headings (H1–H6) — Includes an independent SEO tag selector so editors can set visual style separately from the semantic HTML tag.
3. Tables — Insert and edit tables with row/column controls, all from the toolbar.
4. Images from Media Library — Pick images directly from Strapi's Media Library; set alt text, alignment (left, center, right), and dimensions with resize handle.
5. Code blocks — Fenced code blocks with syntax highlighting for developer-facing content.
6. Links — Inline link insertion with configurable HTML attributes (e.g., rel, target).
7. Text & highlight colors — Brand-aware color pickers driven by your theme config.
8. Blockquotes & lists — Ordered, unordered, and task lists with blockquote support.
9. Custom CSS / theming — Inject a stylesheet URL or inline CSS to match the editor to your design system.
10. Config validation — The plugin validates your preset config at startup and throws a readable error if a feature key is misspelled.

## Bootstrap a new Strapi Project

### Create a Strapi Project
Start by creating a new Strapi project.

```
npx create-strapi@latest tiptap-integration
```

Ensure you answer the prompts. Here are the ones for this integration:

```shell
? Please log in or sign up. Skip
? Do you want to use the default database (sqlite) ? Yes
? Start with an example structure & data? No
? Start with Typescript? Yes
? Install dependencies with npm? Yes
? Initialize a git repository? No
```

### Start Your Strapi Development Server
Next, start your Strapi development server:

```
cd tiptap-integration
npm run dev
```

The command above will open an admin registration page. Fill in the admin user details and click the "Let's start" button.

![strapi admin registration.png](https://delicate-dawn-ac25646e6d.media.strapiapp.com/strapi_admin_registration_ab9dd42fa5.png)

After admin registration, you should be redirected to your Strapi dashboard as shown below:

![strapi dashboard.png](https://delicate-dawn-ac25646e6d.media.strapiapp.com/strapi_dashboard_cc9b9372d9.png)

## Install and Configure Strapi Tiptap Plugin

The Tiptap editor plugin for Strapi 5 is a drop-in TipTap [WYSIWYG editor](https://strapi.io/blog/best-wysiwyg-editors) 
created by Notum Technologies. You can find more plugins developed by the Strapi community in the [Plugin Marketplace](https://market.strapi.io/).

```
npm install @notum-cz/strapi-plugin-tiptap-editor
```

### Configure Strapi Tiptap Plugin

Inside your Strapi project backend code, navigate to the `./config/plugins.ts` file and update it with the following:

```ts
// Path: ./config/plugins.ts

// config/plugins.ts

export default () => ({
  'tiptap-editor': {
    config: {
      presets: {
        // A minimal preset for short-form content like titles or captions
        minimal: {
          bold: true,
          italic: true,
          underline: true,
        },

        // A standard preset for blog posts and articles
        standard: {
          bold: true,
          italic: true,
          underline: true,
          strike: true,
          heading: true,
          bulletList: true,
          orderedList: true,
          blockquote: true,
          link: true,
        },

        // A full preset with every feature enabled
        full: {
          bold: true,
          italic: true,
          underline: true,
          strike: true,
          code: true,
          codeBlock: true,
          heading: true,
          blockquote: true,
          bulletList: true,
          orderedList: true,
          link: true,
          table: true,
          textAlign: true,
          superscript: true,
          subscript: true,
          mediaLibrary: true,
        },
      },
    },
  },
});
```

> ✋ NOTE: Every feature is opt-in, meaning nothing appears in the toolbar unless you explicitly set it to true in your preset. 

You can define as many presets as you need. 

### Assign Tiptap to fields in Strapi
Create a collection type called **Blog** and add the following fields


|Name | Field|
|------|---|
|`title`| Text (Short text)|
| `banner`  |  Media (Single media)   |
| `content` |  Rich Text (TipTap) |

<br/>

For `content` which you want to use for the custom editor content, here is what you should do:

1. Click the **"Add another field"** button.
2. Ensure you click the "Custom" tab beside the "Default" tab. 



![click custom tab.png](https://delicate-dawn-ac25646e6d.media.strapiapp.com/click_custom_tab_b1f8af0cb9.png)


3. Select the "Rich Text (Tiptap)" field and give it the name `content`. 

![select the custom rich text tiptap plugin.png](https://delicate-dawn-ac25646e6d.media.strapiapp.com/select_the_custom_rich_text_tiptap_plugin_11c6de0242.png)

4. Click the "finish" button after selecting the "Rich Text (Tiptap)" field.
5. Finally, click the "Save" button to save the new collection type.

This is what your new collection type should look like.

![collection type with new rich text .png](https://delicate-dawn-ac25646e6d.media.strapiapp.com/collection_type_with_new_rich_text_ff84a5bfc3.png)

## Testing Tiptap Custom Editor in Strapi
Head over to your **Blog** collection type and create a new entry.

### Enable Tiptap Pretexts in Strapi
Notice that the editor is minimal, showing only "bold" and "italics" features. This is because you haven't selected the preset you configured above.

![minimal custom tiptap editor.png](https://delicate-dawn-ac25646e6d.media.strapiapp.com/minimal_custom_tiptap_editor_e3e807b9ba.png)


1. Head over to the **Content-Type Builder** and click the **Blog** collection type.
2. Click the `content` field, which contains the Tiptap editor.
3. Click the "ADVANCED SETTINGS" tab and select the pretext you want.

![select pretext.png](https://delicate-dawn-ac25646e6d.media.strapiapp.com/select_pretext_2b99204cd3.png)

5. Ensure you click the "Save" button to save changes.


Now, proceed to the **Content Manager** and create new blog entries. You should see the integrated Tiptap editor.

![tiptap in strapi.png](https://delicate-dawn-ac25646e6d.media.strapiapp.com/tiptap_in_strapi_6cd01c0bb5.png)

### Fetch Tiptap Content
When you visit the **Blog** collection type, you should see the way the Tiptap `content` field values are displayed.

![tiptap entries.png](https://delicate-dawn-ac25646e6d.media.strapiapp.com/tiptap_entries_82af620025.png)
 
This is stored as a JSON document, which is a tree of ProseMirror nodes. And when you fetch **Blog** entries, you should see the JSON of each entry:

![tiptap json response.png](https://delicate-dawn-ac25646e6d.media.strapiapp.com/tiptap_json_response_3a62c01951.png)

In the frontend, this will be parsed using the `JSON.parse()` function, as you will see shortly.


## Enable Strapi API Permissions

In order to be able to fetch content from your Strapi backend, you have to enable API permission for your content types.

Ensure you enable API permission for `find` and `findone` of the **Blog** collection type. 

Go to ***Settings > Roles > Public***

![enable API Permission for Blog Collection.png](https://delicate-dawn-ac25646e6d.media.strapiapp.com/enable_API_Permission_for_Blog_Collection_242adcb19a.png)


Ensure you also enable API permission for the media library.

![enable api permissions for image.png](https://delicate-dawn-ac25646e6d.media.strapiapp.com/enable_api_permissions_for_image_5ffa88d864.png)

## Set Up a Next.js Frontend

### Create a Next.js App
Start by creating a Next.js application.

```
npx create-next-app frontend
```

After installation, start your Next.js frontend by running the command below:

```
 npm run dev
```

Open the URL http://localhost:3000 to view your frontend as shown below:

![nextjs frontend.png](https://delicate-dawn-ac25646e6d.media.strapiapp.com/nextjs_frontend_ead58644e3.png)

### Install Tiptap in Next.js

1. Install Tiptap 
```
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit
```

* `@tiptap/react`: for Tiptap React components.
* `@tiptap/pm`: wrapper package for ProseMirror.
* `@tiptap/starter-kit`: Contains all the basic Tiptap extensions such as bold, italic, strike, code, etc.

### Install Tiptap Dependencies
For us to use Tiptap, we need to install some dependencies.
```
npm install @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-cell @tiptap/extension-table-header @tiptap/extension-image
```

Here are the dependencies we installed above:


* `@tiptap/extension-table`, `@tiptap/extension-table-row`, `tiptap/extension-table-cell`, `@tiptap/extension-table-header`: Extensions for tables.
* `@tiptap/extension-image`: Image extension.

### Install Strapi Client Library
The [Strapi client](https://docs.strapi.io/cms/api/client) library helps you interact with your Strapi backend.

```
npm install @strapi/client
```

## Fetch and Render Tiptap Content in Next.js

### Step 1: Create a Utility File
Inside the `./app` folder, create a `utils.tsx` file and add the following code:

```tsx
// Path: ./app/utils.tsx

import { strapi } from "@strapi/client";

const sdk = strapi({ baseURL: "http://localhost:1337/api" });
const STRAPI_URL = "http://localhost:1337";

const fixImageUrls = (node) => {
  if (node.type === "image" && node.attrs?.src?.startsWith("/uploads")) {
    node.attrs.src = `${STRAPI_URL}${node.attrs.src}`;
  }
  if (node.content) {
    node.content.forEach(fixImageUrls);
  }
  return node;
};

export { sdk, STRAPI_URL, fixImageUrls };
```

This utility file above sets up and exports the Strapi API client, the base server URL, and a helper function that recursively walks TipTap JSON content nodes to rewrite relative image paths into full URLs.

We will use exports in the following sections.



### Step 2: Create Custom CSS for Tiptap Content
Update the `./app/globals.css` file with your custom CSS.

Here is how it should look:
```css
/* Base prose container */
.tiptap-content {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 1rem;
  line-height: 1.75;
  color: #1a1a1a;
  max-width: 65ch;
  margin: 0 auto;
}

/* Headings */
.tiptap-content h1 {
  font-size: 2.25rem;
  font-weight: 800;
  line-height: 1.2;
  margin: 2.5rem 0 1rem;
  letter-spacing: -0.02em;
}


/* Other CSS values */
```

***[👉 Full Custom CSS Code](https://github.com/Theodore-Kelechukwu-Onyejiaku/tiptap-strapi-integration/blob/main/frontend/app/globals.css)***


### Step 3: Edit Next.js Configuration
Navigate to your Next.js configuration file `./next.config.ts` and add the following code:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/**",
      },
    ],
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
```

This will allow Next.js to optimize images hosted locally for `localhost`.

### Step 4: Fetch Content from Strapi Backend
Inside the `./app/page.tsx` file, add the following code:

```tsx
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

```

The page above fetches all blog posts from Strapi using the `sdk` we created previously and renders them as a linked list, each pointing to its own detail page by `documentId` as shown below.

![homepage with blog posts.png](https://delicate-dawn-ac25646e6d.media.strapiapp.com/homepage_with_blog_posts_1f4f3c3724.png)

### Fetch and Render TipTap Content in Next.js
Navigate to the `./app` folder, and create a new folder called `[id]`. Inside the `[id]` folder, create a `page.tsx` file and add the following code:

```tsx
// Path: frontend/app/[id]/page.tsx

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

```

This client component above fetches a single blog post by ID from Strapi, fixes its image URLs, then renders the content in a read-only TipTap editor.

* `use(props.params)` — unwraps the route params to extract the post ID from the URL.
* `useEffect` + `fetchSinglePost` — fetches a single blog post from Strapi by id, populating the `banner`, then consolidates the `title`, `banner` URL, and parsed `content` into a single post state object.
* `fixImageUrls` — walks the parsed TipTap JSON and rewrites relative image paths to absolute Strapi URLs so they render correctly in the editor.
* `useEditor` — initializes a read-only TipTap `editor` instance with table and image support, reinitializing whenever `post.content` changes.
* `NextImage` — renders the post's banner image using Next.js's optimized image component, conditionally shown only when a banner URL exists.

<video autoplay muted loop playsinline width="100%" style="border-radius: 10px;">
  <source src="https://delicate-dawn-ac25646e6d.media.strapiapp.com/tiptap_demo_5d59d556e9.mp4" type="video/mp4">
</video>

> ✋ **NOTE:** If you want to apply syntax highlighting, then you need to use the [CodeBlockLowlight](https://tiptap.dev/docs/editor/extensions/nodes/code-block-lowlight) extension.

## GitHub Repository
Here is the complete code for Strapi and Tiptap integration.

***[👉 Full Integration Code](https://github.com/Theodore-Kelechukwu-Onyejiaku/tiptap-strapi-integration)***

Awesome, great job!

## Strapi Open Office Hours
If you have any questions about Strapi 5 or just would like to stop by and say hi, you can join us at **Strapi's Discord Open Office Hours** Monday through Friday at 12:30 pm - 1:30 pm CST: [Strapi Discord Open Office Hours](https://discord.com/invite/strapi)

For more details, visit the [Strapi documentation](https://strapi.io/documentation) and [TipTap documentation](https://tiptap.dev/docs).
