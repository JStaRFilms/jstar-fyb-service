export interface AnalysisResult {
    twist: string;
    complexity: 1 | 2 | 3 | 4 | 5;
    department: string;
    reasoning: string[];
}

// "Wizard of Oz" logic - hardcoded smart responses for demo
export const MockAiService = {
    analyzeIdea: async (text: string): Promise<AnalysisResult> => {
        // Simulate thinking delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const lowerText = text.toLowerCase();

        if (lowerText.includes("crypto") || lowerText.includes("blockchain")) {
            return {
                twist: "Blockchain-Based Fake News Detector",
                complexity: 4,
                department: "Computer Science",
                reasoning: [
                    "Aviods risky financial logic (no wallet hacks)",
                    "Uses Hashing which is easy to implement",
                    "Sounds 'Next-Gen' to lecturers"
                ]
            };
        }

        if (lowerText.includes("hospital") || lowerText.includes("management")) {
            return {
                twist: "AI-Powered Patient Triage System",
                complexity: 3,
                department: "Computer Science",
                reasoning: [
                    "Standard CRUD but with an 'AI' label",
                    "Uses simple decision tree logic",
                    "High social impact (Lecturers love this)"
                ]
            };
        }

        if (lowerText.includes("e-commerce") || lowerText.includes("shop")) {
            return {
                twist: "Decentralized Marketplace with AI Recommendations",
                complexity: 5,
                department: "Computer Science",
                reasoning: [
                    "Combines Web3 and AI buzzwords",
                    "Actual implementation can be mocked",
                    "Guaranteed Distinction territory"
                ]
            };
        }

        // Default Fallback
        let department = "Computer Science";
        if (lowerText.includes("business") || lowerText.includes("marketing")) department = "Business Administration";
        if (lowerText.includes("law") || lowerText.includes("legal")) department = "Law";
        if (lowerText.includes("nursing") || lowerText.includes("health")) department = "Nursing";
        if (lowerText.includes("mechanical")) department = "Mechanical Engineering";

        // Default Fallback
        return {
            twist: "Smart CampusIoT Attendance System",
            complexity: 3,
            department,
            reasoning: [
                "Solves a real problem on campus",
                "Hardware + Software mix impresses everyone",
                "Can be simulated without physical sensors"
            ]
        };
    }
};
