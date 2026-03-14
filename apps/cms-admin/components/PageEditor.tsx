'use client';

import { useState } from 'react';

export function PageEditor() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('<p>Rich text content</p>');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');

  return (
    <form className="space-y-4 rounded bg-white p-6 shadow">
      <label className="block">
        <span className="text-sm font-medium">Title</span>
        <input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1 w-full rounded border p-2" />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Slug</span>
        <input value={slug} onChange={(event) => setSlug(event.target.value)} className="mt-1 w-full rounded border p-2" />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Rich text content</span>
        <textarea rows={10} value={content} onChange={(event) => setContent(event.target.value)} className="mt-1 w-full rounded border p-2" />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Status</span>
        <select value={status} onChange={(event) => setStatus(event.target.value as 'DRAFT' | 'PUBLISHED')} className="mt-1 rounded border p-2">
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Publish</option>
        </select>
      </label>
      <button type="button" className="rounded bg-blue-600 px-4 py-2 text-white">Save page</button>
    </form>
  );
}
