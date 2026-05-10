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
