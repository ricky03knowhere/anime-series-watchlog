interface GenreBadgeProps {
  name: string;
}

function GenreBadge({ name }: GenreBadgeProps) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border whitespace-nowrap"
      style={{
        background: 'var(--color-secondary-50)',
        color: 'var(--color-secondary-700)',
        borderColor: 'var(--color-secondary-200)',
      }}
    >
      {name}
    </span>
  );
}

export default GenreBadge;
