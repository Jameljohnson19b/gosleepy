import { Offer, Rate } from '@/types/hotel';

export type SupportRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface SupportRisk {
    riskScore: number;
    label: SupportRiskLevel;
    reasonCodes: string[];
}

export interface SupportRiskInputs {
    confirmationConfidence: number; // 0..1
    supplyPressure: number; // 0..1
    quoteFailRate: number; // 0..1
    bookingFailRate: number; // 0..1
    policyText: string;
    is1AMMode: boolean;
    isDriveMode: boolean;
}

export function computeSupportRisk(inputs: SupportRiskInputs): SupportRisk {
    const {
        confirmationConfidence,
        supplyPressure,
        quoteFailRate,
        bookingFailRate,
        policyText,
        is1AMMode,
        isDriveMode
    } = inputs;

    // Normalize inputs
    const lowConfidence = 1 - confirmationConfidence;
    const policyComplexity = computePolicyComplexity(policyText);
    const nightFactor = is1AMMode ? 1 : 0;
    const driveFactor = isDriveMode ? 1 : 0;

    // Weighted Score
    // (0.30 * low_confidence)
    // (0.25 * pressure)
    // (0.15 * quote_instability)
    // (0.10 * booking_fail)
    // (0.10 * policy_complexity)
    // (0.05 * night_factor)
    // (0.05 * drive_factor)
    const riskScore = (
        (0.30 * lowConfidence) +
        (0.25 * supplyPressure) +
        (0.15 * quoteFailRate) +
        (0.10 * bookingFailRate) +
        (0.10 * policyComplexity) +
        (0.05 * nightFactor) +
        (0.05 * driveFactor)
    );

    // Determine Label
    let label: SupportRiskLevel = 'LOW';
    if (riskScore > 0.6) label = 'HIGH';
    else if (riskScore > 0.3) label = 'MEDIUM';

    // Generate Reason Codes
    const reasonCodes: string[] = [];
    if (supplyPressure > 0.7) reasonCodes.push("AVAILABILITY_CHANGING_FAST");
    if (quoteFailRate > 0.2) reasonCodes.push("QUOTE_CHANGES_COMMON");
    if (confirmationConfidence < 0.5) reasonCodes.push("CONFIRMATION_DELAY_POSSIBLE");
    if (label === 'LOW') {
        reasonCodes.push("STABLE_PRICE");
        reasonCodes.push("CONFIRMS_FAST");
    }

    return {
        riskScore: Number(riskScore.toFixed(2)),
        label,
        reasonCodes: reasonCodes.slice(0, 3)
    };
}

function computePolicyComplexity(text: string): number {
    if (!text) return 0.4;

    let complexity = 0;
    const lowerText = text.toLowerCase();

    if (lowerText.includes('non-refundable') || lowerText.includes('no refund')) complexity += 0.2;
    if (lowerText.includes('cancel by') || lowerText.includes('window')) complexity += 0.2;
    if (lowerText.includes('%') || lowerText.includes('charge')) complexity += 0.2;
    if (text.length > 200) complexity += 0.2;

    return Math.min(1, complexity);
}

export function applySupportRiskPenalty(baseRank: number, riskScore: number): number {
    // rank_score -= (risk_score * 0.10)
    return baseRank - (riskScore * 0.10);
}
