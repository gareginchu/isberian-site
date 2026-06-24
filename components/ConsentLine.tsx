import Link from "next/link";

export const CONSENT_TEXT =
  "I'd like to be contacted about my inquiry. I've read the privacy notice and understand my message and any photos may be retained for follow-up.";

export function ConsentLine({
  id,
  checked,
  onChange,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="flex items-start gap-3 text-sm text-ink-700">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 border-ink-700 text-oxblood focus:ring-oxblood"
        required
      />
      <span>
        {CONSENT_TEXT}{" "}
        <Link href="/privacy" className="underline hover:text-oxblood">
          Privacy notice
        </Link>
        .
      </span>
    </label>
  );
}
