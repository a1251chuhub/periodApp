/**
 * Cycle prediction service using weighted average method
 * Pure function with no external dependencies
 */
export class CycleService {
  /**
   * Calculate the predicted next period date based on history
   * Uses weighted average formula: Predicted = (C1 × 0.5) + (C2 × 0.3) + (C3 × 0.2)
   * Where C1, C2, C3 are the most recent cycle lengths (in days)
   *
   * Outlier filtering: Cycles < 21 or > 45 days are excluded
   *
   * @param historyDates - Array of start dates in ISO format (YYYY-MM-DD), sorted chronologically
   * @returns Predicted next period start date in ISO format (YYYY-MM-DD), or null if prediction impossible
   */
  static calculateNextPeriod(historyDates: string[]): string | null {
    if (!historyDates || historyDates.length === 0) {
      return null
    }

    // Sort dates chronologically (just in case)
    const sortedDates = [...historyDates].sort()

    // Edge case: Only 1 date - use default 28-day cycle
    if (sortedDates.length === 1) {
      const lastDate = new Date(sortedDates[0])
      lastDate.setDate(lastDate.getDate() + 28)
      return lastDate.toISOString().split('T')[0]
    }

    // Edge case: Only 2 dates - use the cycle between them
    if (sortedDates.length === 2) {
      const cycleLength = this.calculateDaysBetween(sortedDates[0], sortedDates[1])
      const lastDate = new Date(sortedDates[1])
      lastDate.setDate(lastDate.getDate() + cycleLength)
      return lastDate.toISOString().split('T')[0]
    }

    // Calculate cycle lengths between consecutive dates
    const cycleLengths: number[] = []
    for (let i = 1; i < sortedDates.length; i++) {
      const cycleLength = this.calculateDaysBetween(sortedDates[i - 1], sortedDates[i])
      cycleLengths.push(cycleLength)
    }

    // Filter out outliers (cycles < 21 or > 45 days)
    const validCycles = cycleLengths.filter(cycle => cycle >= 21 && cycle <= 45)

    // Not enough valid cycles
    if (validCycles.length === 0) {
      return null
    }

    // If we have less than 3 cycles, use available ones with equal weighting
    if (validCycles.length === 1) {
      const lastDate = new Date(sortedDates[sortedDates.length - 1])
      lastDate.setDate(lastDate.getDate() + validCycles[0])
      return lastDate.toISOString().split('T')[0]
    }

    if (validCycles.length === 2) {
      const avgCycle = (validCycles[0] + validCycles[1]) / 2
      const lastDate = new Date(sortedDates[sortedDates.length - 1])
      lastDate.setDate(lastDate.getDate() + Math.round(avgCycle))
      return lastDate.toISOString().split('T')[0]
    }

    // Use the last 3 cycles with weighted average
    const lastThreeCycles = validCycles.slice(-3)
    const weightedAverage =
      (lastThreeCycles[2] * 0.5) + // Most recent cycle
      (lastThreeCycles[1] * 0.3) + // Second most recent
      (lastThreeCycles[0] * 0.2)   // Third most recent

    const lastDate = new Date(sortedDates[sortedDates.length - 1])
    lastDate.setDate(lastDate.getDate() + Math.round(weightedAverage))

    return lastDate.toISOString().split('T')[0]
  }

  /**
   * Calculate days between two dates (inclusive)
   * @param dateStr1 - First date string (YYYY-MM-DD)
   * @param dateStr2 - Second date string (YYYY-MM-DD)
   * @returns Number of days between the dates
   */
  private static calculateDaysBetween(dateStr1: string, dateStr2: string): number {
    const date1 = new Date(dateStr1)
    const date2 = new Date(dateStr2)

    // Calculate difference in milliseconds
    const diffTime = Math.abs(date2.getTime() - date1.getTime())

    // Convert to days (round to nearest whole number)
    return Math.round(diffTime / (1000 * 60 * 60 * 24))
  }
}
