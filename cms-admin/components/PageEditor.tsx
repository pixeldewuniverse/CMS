'use client';

import { useState } from 'react';

export function PageEditor() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('<p>Write your page content...</p>');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');

  return (
    <form className="space-y-4 rounded-lg bg-white p-6 shadow">
      <div>
        <label className="mb-1 block text-sm font-medium">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded border p-2" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Slug</label>
        <input value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full rounded border p-2" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Rich Text Editor</label>
        <textarea
          rows={10}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full rounded border p-2 font-mono"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED')} className="rounded border p-2">
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Publish</option>
        </select>
      </div>

      <button type="button" className="rounded bg-blue-600 px-4 py-2 text-white">Save Page</button>
    </form>
  );
}
