import { Icon } from './Icon';
import type { ProcessingLocation } from '@alldocs/config/tools';

/**
 * The privacy badge is a headline feature of AllDocs.
 * - local:  "Processed locally — your file never left this device"
 * - server: "Encrypted upload — auto-deleted within the hour"
 */
export function PrivacyBadge({
  processing,
  className = '',
}: {
  processing: ProcessingLocation;
  className?: string;
}) {
  if (processing === 'local') {
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-pill border border-success/30 bg-success/10 px-3.5 py-1.5 text-sm font-semibold text-success ${className}`}
      >
        <Icon name="lock" size={15} />
        Processed locally — your file never left this device
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-pill border border-accent/30 bg-accent/10 px-3.5 py-1.5 text-sm font-semibold text-accent ${className}`}
    >
      <Icon name="shield-check" size={15} />
      Encrypted upload — auto-deleted within the hour
    </span>
  );
}
