'use client';

interface PasswordRequirementsProps {
  password: string;
}

export function getPasswordValidationState(password: string) {
  const hasLength = password.length >= 12;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const rules = [
    { label: 'At least 12 characters', met: hasLength },
    { label: 'One uppercase letter (A-Z)', met: hasUpper },
    { label: 'One lowercase letter (a-z)', met: hasLower },
    { label: 'One number (0-9)', met: hasNumber },
    { label: 'One special character (!@#$%^&* etc.)', met: hasSpecial },
  ];

  const metCount = rules.filter((r) => r.met).length;
  const isValid = metCount === 5;

  const missingRules = rules.filter((r) => !r.met).map((r) => r.label);

  return {
    rules,
    hasLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
    metCount,
    isValid,
    missingRules,
  };
}

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  if (!password) {
    return (
      <div className="mt-2 text-[11px] text-gray-500 space-y-1 bg-gray-50 p-3 rounded-lg border border-gray-200">
        <p className="font-semibold text-gray-700">Password Security Requirements:</p>
        <ul className="space-y-0.5 pl-1 text-gray-500">
          <li>• Minimum 12 characters</li>
          <li>• Uppercase & lowercase letters</li>
          <li>• At least one number and special character</li>
        </ul>
      </div>
    );
  }

  const { rules, metCount, isValid } = getPasswordValidationState(password);

  const strengthColor =
    metCount <= 2
      ? 'bg-red-500'
      : metCount <= 4
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  const strengthLabel =
    metCount <= 2
      ? 'Weak'
      : metCount <= 4
      ? 'Moderate'
      : 'Strong (Compliant)';

  return (
    <div className="mt-2.5 space-y-2.5 bg-gray-50/80 p-3.5 rounded-lg border border-gray-200 text-xs">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-[11px]">
          <span className="font-medium text-gray-600">Password Strength:</span>
          <span
            className={`font-semibold ${
              metCount <= 2
                ? 'text-red-600'
                : metCount <= 4
                ? 'text-amber-600'
                : 'text-emerald-600'
            }`}
          >
            {strengthLabel}
          </span>
        </div>
        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-200 ${strengthColor}`}
            style={{ width: `${(metCount / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Rules Checklist */}
      <ul className="space-y-1 text-[11px]">
        {rules.map((rule) => (
          <li
            key={rule.label}
            className={`flex items-center space-x-2 transition-colors ${
              rule.met ? 'text-emerald-700 font-medium' : 'text-gray-500'
            }`}
          >
            {rule.met ? (
              <span className="text-emerald-600 font-bold">✓</span>
            ) : (
              <span className="text-gray-400">○</span>
            )}
            <span>{rule.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
