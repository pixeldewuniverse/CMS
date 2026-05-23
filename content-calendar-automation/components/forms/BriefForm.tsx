'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

interface BriefFormData {
  name: string;
  description: string;
  productName: string;
  productDescription: string;
  targetAudience: string;
  goal: string;
  tone: string;
  platforms: {
    instagram: { enabled: boolean; postFrequency: string };
    linkedin: { enabled: boolean; postFrequency: string };
    tiktok: { enabled: boolean; postFrequency: string };
    twitter: { enabled: boolean; postFrequency: string };
    facebook: { enabled: boolean; postFrequency: string };
  };
  colorPalette: string[];
  designStyle: string;
}

const DESIGN_STYLES = ['Minimalist', 'Bold', 'Playful', 'Professional', 'Creative'];
const TONE_OPTIONS = [
  'Professional',
  'Friendly',
  'Witty',
  'Inspirational',
  'Educational',
];
const FREQUENCY_OPTIONS = ['1x/week', '3x/week', '5x/week', 'Daily'];

export default function BriefForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BriefFormData>({
    name: '',
    description: '',
    productName: '',
    productDescription: '',
    targetAudience: '',
    goal: '',
    tone: 'Professional',
    platforms: {
      instagram: { enabled: true, postFrequency: '3x/week' },
      linkedin: { enabled: true, postFrequency: '3x/week' },
      tiktok: { enabled: false, postFrequency: '3x/week' },
      twitter: { enabled: false, postFrequency: '1x/week' },
      facebook: { enabled: false, postFrequency: '1x/week' },
    },
    colorPalette: ['#534AB7', '#0F6E56'],
    designStyle: 'Modern',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.name ||
      !formData.productName ||
      !formData.targetAudience ||
      !formData.goal
    ) {
      toast.error('Isi semua field yang wajib');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/briefs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId: 'user-placeholder', // TODO: Get from auth context
          status: 'active',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create brief');
      }

      const result = await response.json();
      toast.success('Brief berhasil dibuat!');

      // Reset form
      setFormData({
        name: '',
        description: '',
        productName: '',
        productDescription: '',
        targetAudience: '',
        goal: '',
        tone: 'Professional',
        platforms: {
          instagram: { enabled: true, postFrequency: '3x/week' },
          linkedin: { enabled: true, postFrequency: '3x/week' },
          tiktok: { enabled: false, postFrequency: '3x/week' },
          twitter: { enabled: false, postFrequency: '1x/week' },
          facebook: { enabled: false, postFrequency: '1x/week' },
        },
        colorPalette: ['#534AB7', '#0F6E56'],
        designStyle: 'Modern',
      });

      // TODO: Redirect to dashboard/brief detail
      console.log('Brief created:', result);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Ada error saat membuat brief');
    } finally {
      setLoading(false);
    }
  };

  const handlePlatformToggle = (platform: keyof BriefFormData['platforms']) => {
    setFormData((prev) => ({
      ...prev,
      platforms: {
        ...prev.platforms,
        [platform]: {
          ...prev.platforms[platform],
          enabled: !prev.platforms[platform].enabled,
        },
      },
    }));
  };

  const handleFrequencyChange = (
    platform: keyof BriefFormData['platforms'],
    frequency: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      platforms: {
        ...prev.platforms,
        [platform]: {
          ...prev.platforms[platform],
          postFrequency: frequency,
        },
      },
    }));
  };

  const handleColorAdd = (color: string) => {
    if (!formData.colorPalette.includes(color)) {
      setFormData((prev) => ({
        ...prev,
        colorPalette: [...prev.colorPalette, color],
      }));
    }
  };

  const handleColorRemove = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      colorPalette: prev.colorPalette.filter((c) => c !== color),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Buat Brief Bisnis</h1>
        <p className="text-slate-600">Input informasi produk untuk auto-generate content calendar</p>
      </div>

      {/* SECTION 1: Basic Info */}
      <div className="card p-6 space-y-4">
        <h2 className="text-xl font-semibold">1. Informasi Dasar</h2>

        <div>
          <label className="block text-sm font-medium mb-2">
            Nama Brief <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="input-base"
            placeholder="e.g., Tech Product Q2"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Deskripsi Brief</label>
          <textarea
            className="input-base"
            placeholder="Deskripsi singkat brief ini"
            rows={2}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>
      </div>

      {/* SECTION 2: Product Info */}
      <div className="card p-6 space-y-4">
        <h2 className="text-xl font-semibold">2. Informasi Produk</h2>

        <div>
          <label className="block text-sm font-medium mb-2">
            Nama Produk <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="input-base"
            placeholder="e.g., CloudSync Pro"
            value={formData.productName}
            onChange={(e) =>
              setFormData({ ...formData, productName: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Deskripsi Produk</label>
          <textarea
            className="input-base"
            placeholder="Apa yang produk ini lakukan?"
            rows={3}
            value={formData.productDescription}
            onChange={(e) =>
              setFormData({ ...formData, productDescription: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Target Audiens <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="input-base"
            placeholder="e.g., Tech-savvy millennials, enterprise teams"
            value={formData.targetAudience}
            onChange={(e) =>
              setFormData({ ...formData, targetAudience: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Tujuan <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="input-base"
            placeholder="e.g., Increase engagement by 20%"
            value={formData.goal}
            onChange={(e) =>
              setFormData({ ...formData, goal: e.target.value })
            }
          />
        </div>
      </div>

      {/* SECTION 3: Tone & Style */}
      <div className="card p-6 space-y-4">
        <h2 className="text-xl font-semibold">3. Tone & Design</h2>

        <div>
          <label className="block text-sm font-medium mb-2">Tone</label>
          <select
            className="input-base"
            value={formData.tone}
            onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
          >
            {TONE_OPTIONS.map((tone) => (
              <option key={tone} value={tone}>
                {tone}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Design Style</label>
          <select
            className="input-base"
            value={formData.designStyle}
            onChange={(e) =>
              setFormData({ ...formData, designStyle: e.target.value })
            }
          >
            {DESIGN_STYLES.map((style) => (
              <option key={style} value={style}>
                {style}
              </option>
            ))}
          </select>
        </div>

        {/* Color Palette */}
        <div>
          <label className="block text-sm font-medium mb-2">Color Palette</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.colorPalette.map((color) => (
              <div key={color} className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded border border-slate-200"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm">{color}</span>
                <button
                  type="button"
                  onClick={() => handleColorRemove(color)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <input
            type="text"
            className="input-base"
            placeholder="#FF5733 (tekan Enter untuk tambah)"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const color = (e.target as HTMLInputElement).value.trim();
                if (color) {
                  handleColorAdd(color);
                  (e.target as HTMLInputElement).value = '';
                }
              }
            }}
          />
        </div>
      </div>

      {/* SECTION 4: Platform Settings */}
      <div className="card p-6 space-y-4">
        <h2 className="text-xl font-semibold">4. Platform & Frekuensi</h2>

        {Object.entries(formData.platforms).map(([platform, config]) => (
          <div key={platform} className="flex items-center gap-4 p-3 bg-slate-50 rounded">
            <label className="flex items-center gap-2 cursor-pointer flex-1">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={() =>
                  handlePlatformToggle(
                    platform as keyof BriefFormData['platforms']
                  )
                }
                className="w-4 h-4"
              />
              <span className="font-medium capitalize">{platform}</span>
            </label>

            {config.enabled && (
              <select
                value={config.postFrequency}
                onChange={(e) =>
                  handleFrequencyChange(
                    platform as keyof BriefFormData['platforms'],
                    e.target.value
                  )
                }
                className="input-base py-1"
              >
                {FREQUENCY_OPTIONS.map((freq) => (
                  <option key={freq} value={freq}>
                    {freq}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Membuat brief...' : 'Buat Brief'}
        </button>
        <button type="reset" className="btn-ghost">
          Reset
        </button>
      </div>
    </form>
  );
}
