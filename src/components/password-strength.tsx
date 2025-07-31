
'use client';
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

interface PasswordStrengthProps {
    password?: string;
    strength: number;
}

const strengthLevels = [
    { text: 'Very Weak', color: 'bg-red-500' },
    { text: 'Weak', color: 'bg-red-500' },
    { text: 'Fair', color: 'bg-yellow-500' },
    { text: 'Good', color: 'bg-lime-500' },
    { text: 'Strong', color: 'bg-green-500' },
    { text: 'Very Strong', color: 'bg-green-500' },
];

const requirements = [
    { text: "At least 8 characters", regex: /.{8,}/ },
    { text: "At least one lowercase letter (a-z)", regex: /[a-z]/ },
    { text: "At least one uppercase letter (A-Z)", regex: /[A-Z]/ },
    { text: "At least one number (0-9)", regex: /[0-9]/ },
    { text: "At least one special character", regex: /[^a-zA-Z0-9]/ },
];

export default function PasswordStrength({ password = "", strength }: PasswordStrengthProps) {
    const currentStrength = strengthLevels[strength];
    
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                        className={cn("h-full transition-all duration-300", currentStrength?.color)}
                        style={{ width: `${(strength / (strengthLevels.length -1)) * 100}%` }}
                    />
                </div>
                <span className="text-sm font-medium w-24 text-right">{currentStrength?.text}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {requirements.map((req, index) => {
                    const isValid = req.regex.test(password);
                    return (
                        <div key={index} className={cn("flex items-center gap-2", isValid ? "text-green-500" : "text-red-500")}>
                            {isValid ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                            <span>{req.text}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}

