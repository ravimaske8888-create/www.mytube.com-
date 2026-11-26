import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Share2,
  Code,
  QrCode,
  Mail,
  Send,
  ExternalLink,
} from 'lucide-react';
import { VideoItem } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoItem;
  currentTime?: number;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  video,
  currentTime = 0,
}) => {
  const [copied, setCopied] = useState(false);
  const [includeTimestamp, setIncludeTimestamp] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://mytube.app';
  const timeQuery = includeTimestamp && currentTime > 0 ? `&t=${Math.floor(currentTime)}` : '';
  const shareUrl = `${origin}?video=${video.id}${timeQuery}`;
  const shareText = `Check out "${video.title}" by ${video.channelName || video.channelHandle || 'mytube creator'} on mytube!`;

  const fallbackCopy = (text: string) => {
    try {
      const input = document.createElement('input');
      input.value = text;
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.focus();
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    } catch {
      // Ignore if unsupported
    }
  };

  const handleCopyLink = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).catch(() => {
        fallbackCopy(shareUrl);
      });
    } else {
      fallbackCopy(shareUrl);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: shareText,
          url: shareUrl,
        });
        onClose();
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  const shareTargets = [
    {
      name: 'WhatsApp',
      bg: 'bg-[#25D366]',
      hover: 'hover:bg-[#1ebe57]',
      textColor: 'text-white',
      icon: (
        <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
      action: () => {
        window.open(
          `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
          '_blank',
          'noopener,noreferrer'
        );
      },
    },
    {
      name: 'Facebook',
      bg: 'bg-[#1877F2]',
      hover: 'hover:bg-[#166fe5]',
      textColor: 'text-white',
      icon: (
        <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      action: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          '_blank',
          'noopener,noreferrer'
        );
      },
    },
    {
      name: 'X (Twitter)',
      bg: 'bg-black dark:bg-neutral-800 border border-neutral-700',
      hover: 'hover:bg-neutral-800 dark:hover:bg-neutral-700',
      textColor: 'text-white',
      icon: (
        <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      action: () => {
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
          '_blank',
          'noopener,noreferrer'
        );
      },
    },
    {
      name: 'Telegram',
      bg: 'bg-[#229ED9]',
      hover: 'hover:bg-[#1e8ec3]',
      textColor: 'text-white',
      icon: <Send className="w-5 h-5 text-white" />,
      action: () => {
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
          '_blank',
          'noopener,noreferrer'
        );
      },
    },
    {
      name: 'Email',
      bg: 'bg-[#EA4335]',
      hover: 'hover:bg-[#d9382b]',
      textColor: 'text-white',
      icon: <Mail className="w-5 h-5 text-white" />,
      action: () => {
        window.open(
          `mailto:?subject=${encodeURIComponent(video.title)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`,
          '_self'
        );
      },
    },
    {
      name: 'Embed',
      bg: 'bg-neutral-700 hover:bg-neutral-600',
      hover: 'hover:bg-neutral-600',
      textColor: 'text-white',
      icon: <Code className="w-5 h-5 text-white" />,
      action: () => setShowEmbed(true),
    },
    {
      name: 'QR Code',
      bg: 'bg-neutral-700 hover:bg-neutral-600',
      hover: 'hover:bg-neutral-600',
      textColor: 'text-white',
      icon: <QrCode className="w-5 h-5 text-white" />,
      action: () => setShowQr(true),
    },
    ...(typeof navigator !== 'undefined' && 'share' in navigator
      ? [
          {
            name: 'More',
            bg: 'bg-neutral-800 hover:bg-neutral-700 border border-neutral-700',
            hover: 'hover:bg-neutral-700',
            textColor: 'text-white',
            icon: <Share2 className="w-5 h-5 text-white" />,
            action: handleNativeShare,
          },
        ]
      : []),
  ];

  const embedCode = `<iframe width="560" height="315" src="${shareUrl}" title="${video.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;

  const handleCopyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setEmbedCopied(true);
      setTimeout(() => setEmbedCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 text-white rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 pb-9 sm:pb-5 overflow-hidden animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Toast Notification on Copy */}
        {copied && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-emerald-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-top duration-200">
            <Check className="w-4 h-4" />
            <span>Link copied to clipboard!</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-pink-500" />
            <h3 className="font-bold text-lg text-white">Share</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
            aria-label="Close share dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Preview Card */}
        <div className="flex items-center gap-3 my-4 p-2.5 rounded-xl bg-neutral-800/60 border border-neutral-700/50">
          <div className="w-16 h-12 rounded-lg overflow-hidden bg-black flex-shrink-0 relative">
            <img
              src={video.thumbnailUrl || '/mytube-icon.jpg'}
              alt={video.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/mytube-icon.jpg';
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white truncate">{video.title}</h4>
            <p className="text-xs text-neutral-400 truncate">
              {video.channelName || video.channelHandle || '@creator'} • {video.type === 'short' ? 'Short' : 'Video'}
            </p>
          </div>
        </div>

        {/* Social Share Icons Carousel */}
        <div className="my-4">
          <p className="text-xs text-neutral-400 uppercase tracking-wider font-semibold mb-3">
            Share to
          </p>
          <div className="flex items-center gap-3.5 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
            {shareTargets.map((target) => (
              <button
                key={target.name}
                onClick={target.action}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 group active:scale-95 transition-transform"
                title={`Share via ${target.name}`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-105 ${target.bg}`}
                >
                  {target.icon}
                </div>
                <span className="text-[11px] text-neutral-300 font-medium group-hover:text-white whitespace-nowrap">
                  {target.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Copy Link Input Bar */}
        <div className="mt-4 pt-4 border-t border-neutral-800">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span>Copy link</span>
            {currentTime > 0 && (
              <label className="flex items-center gap-1.5 cursor-pointer text-neutral-300 hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={includeTimestamp}
                  onChange={(e) => setIncludeTimestamp(e.target.checked)}
                  className="rounded border-neutral-700 bg-neutral-800 text-pink-600 focus:ring-pink-500 w-3.5 h-3.5"
                />
                <span>Start at {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}</span>
              </label>
            )}
          </div>

          <div className="flex items-center bg-neutral-800 rounded-xl p-1.5 pl-3 border border-neutral-700 focus-within:border-pink-500 transition-colors">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-transparent text-sm text-neutral-200 outline-none truncate pr-2"
            />
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-pink-600 to-indigo-600 text-white hover:opacity-95'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal: QR Code view */}
        {showQr && (
          <div className="absolute inset-0 bg-neutral-900/98 z-20 p-6 flex flex-col items-center justify-center animate-in fade-in">
            <div className="flex justify-between w-full items-center mb-4">
              <h4 className="font-bold text-white text-base">Scan QR to Watch</h4>
              <button
                onClick={() => setShowQr(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-xl flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareUrl)}`}
                alt="QR Code"
                className="w-44 h-44"
              />
            </div>
            <p className="text-xs text-neutral-400 mt-4 text-center">
              Scan with your phone camera to open this {video.type === 'short' ? 'short' : 'video'} on mytube
            </p>
          </div>
        )}

        {/* Modal: Embed Code view */}
        {showEmbed && (
          <div className="absolute inset-0 bg-neutral-900/98 z-20 p-6 flex flex-col justify-between animate-in fade-in">
            <div className="flex justify-between w-full items-center mb-3">
              <h4 className="font-bold text-white text-base">Embed Video</h4>
              <button
                onClick={() => setShowEmbed(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <textarea
              readOnly
              rows={4}
              value={embedCode}
              className="w-full bg-neutral-800 text-neutral-300 font-mono text-xs p-3 rounded-xl border border-neutral-700 outline-none select-all"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowEmbed(false)}
                className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={handleCopyEmbed}
                className="flex items-center gap-1.5 px-4 py-2 bg-pink-600 text-white rounded-lg text-xs font-bold"
              >
                {embedCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {embedCopied ? 'Copied!' : 'Copy Embed Code'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
