import { z } from 'zod';

// Schema for validating chart data
const ChartDataSchema = z.object({
  labels: z.array(z.string().max(100)),
  datasets: z.array(z.object({
    label: z.string().max(100),
    data: z.array(z.number().min(0)),
    backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i), // Hex color validation
  })),
});

// Schema for timeline items
const TimelineItemSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // ISO date format
  title: z.string().min(1).max(200),
  description: z.string().max(500),
});

export type ValidatedChartData = z.infer<typeof ChartDataSchema>;
export type ValidatedTimelineItem = z.infer<typeof TimelineItemSchema>;

/**
 * Validates and sanitizes chart data
 *
 * @param data - Raw chart data
 * @returns Validated chart data
 * @throws {ValidationError} If data is invalid
 *
 * @security Uses Zod schema validation to prevent injection and ensure data integrity
 */
export function validateChartData(data: unknown): ValidatedChartData {
  return ChartDataSchema.parse(data);
}

/**
 * Validates and sanitizes timeline items
 *
 * @param items - Array of raw timeline items
 * @returns Array of validated timeline items
 * @throws {ValidationError} If any item is invalid
 *
 * @security Uses Zod schema validation to prevent injection and ensure data integrity
 */
export function validateTimelineItems(items: unknown[]): ValidatedTimelineItem[] {
  return items.map(item => TimelineItemSchema.parse(item));
}

/**
 * Processes codebase statistics into chart data format
 *
 * @param stats - Codebase statistics object
 * @returns Validated chart data for file types
 *
 * @security Assumes stats come from trusted sources; validation prevents malformed data
 */
export function processCodebaseStatsForChart(stats: { fileTypes: Record<string, number> }): ValidatedChartData {
  const labels = Object.keys(stats.fileTypes);
  const data = Object.values(stats.fileTypes);
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Files by Type',
        data,
        backgroundColor: '#007bff',
      },
    ],
  };
  return validateChartData(chartData);
}
