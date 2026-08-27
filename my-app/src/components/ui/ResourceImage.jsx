export const ResourceImage = ({ src, alt, className }) => (
  <img
    src={src}
    alt={alt}
    className={className}
    onError={e => {
      e.currentTarget.onerror = null;
      e.currentTarget.src = `https://placehold.co/800x600/e5e7eb/9ca3af?text=${encodeURIComponent(alt ?? 'Image')}`;
    }}
  />
);
