import { cn } from "@/lib/utils";

type SplitTextProps = {
  text: string;
  className?: string;
  /** Kept so existing headings compile; headings no longer animate in. */
  delay?: number;
  stagger?: number;
  by?: "word" | "char";
  immediate?: boolean;
};

/**
 * A heading fragment, shown as plain text.
 *
 * It used to rise in word by word from behind a clip mask. On phones the
 * bottoms of the letters appeared a beat after the tops (it looked like the
 * text was filling in), headings started hidden until JavaScript loaded, and
 * every word was its own animation. Plain text is instant and costs nothing.
 */
export function SplitText({ text, className }: SplitTextProps) {
  return <span className={cn("inline", className)}>{text}</span>;
}
