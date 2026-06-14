import { EPOCH_START_TIMESTAMP, SECONDS_PER_EPOCH } from '@/constants';

/**
 * Converts a Unix timestamp to an epoch number
 * @param timestamp - Unix timestamp in seconds
 * @returns The epoch number
 */
export function timestampToEpoch(timestamp: number): number {
  const elapsedSinceStart = timestamp - EPOCH_START_TIMESTAMP;
  return Math.max(1, Math.floor(elapsedSinceStart / SECONDS_PER_EPOCH) + 1);
}

/**
 * Converts an epoch number to a Unix timestamp (start of epoch)
 * @param epoch - The epoch number
 * @returns Unix timestamp in seconds for the start of the epoch
 */
export function epochToTimestamp(epoch: number): number {
  return EPOCH_START_TIMESTAMP + (epoch - 1) * SECONDS_PER_EPOCH;
}

/**
 * Gets the current epoch number
 * @returns The current epoch number
 */
export function getCurrentEpoch(): number {
  const now = Math.floor(Date.now() / 1000);
  return timestampToEpoch(now);
}

/**
 * Formats a timestamp as both date and epoch number
 * @param timestamp - Unix timestamp in seconds
 * @returns Object with formatted date and epoch number
 */
export function formatTimestampWithEpoch(timestamp: number): {
  date: string;
  epoch: number;
} {
  const date = new Date(timestamp * 1000).toLocaleDateString();
  const epoch = timestampToEpoch(timestamp);
  return { date, epoch };
}
