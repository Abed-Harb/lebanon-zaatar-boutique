import { useEffect } from "react";
import { useLocation } from "react-router-dom";

type SeoProps = {
  title: string;
  description?: string;
  /** Set a fixed canonical path like "/anmelden". Defaults to current route. */
  canonicalPath?: string;
  /** Prevent indexing for auth/cart pages */
  noIndex?: boolean;
};

const upsertMeta = (name: string, content: string) => {
  if (!content) return;
  let tag = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

const upsertLink = (rel: string, href: string) => {
  let link = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", rel);
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
};

export const Seo = ({ title, description, canonicalPath, noIndex }: SeoProps) => {
  const location = useLocation();

  useEffect(() => {
    const safeTitle = title.length > 60 ? `${title.slice(0, 57)}...` : title;
    document.title = safeTitle;

    if (description) {
      const safeDesc = description.length > 160 ? `${description.slice(0, 157)}...` : description;
      upsertMeta("description", safeDesc);
    }

    const canonical = new URL(
      canonicalPath ?? `${location.pathname}${location.search}`,
      window.location.origin
    ).toString();
    upsertLink("canonical", canonical);

    if (noIndex) {
      upsertMeta("robots", "noindex,nofollow");
    }
  }, [title, description, canonicalPath, noIndex, location.pathname, location.search]);

  return null;
};
