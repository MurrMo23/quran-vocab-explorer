// Colours for the session's "wrong answer" surfaces. The design system has no soft-red surface token
// yet, so the light values come from the design (#A33A26 on #FBE9E4) with dark equivalents chosen for
// AA contrast on the dark card (#F2B5A5 on #2E1611 is 9.6:1; #F6D3C9 on #2E1611 is 11:1).

/** Soft red bar / tile background with its top or outer border. */
export const WRONG_SURFACE = 'bg-[#FBE9E4] border-[#F0CBC1] dark:bg-[#2E1611] dark:border-[#5C281D]';
/** Strong red outline for a picked wrong option. */
export const WRONG_OUTLINE = 'border-[#A33A26] dark:border-[#E58A72]';
/** Heading text on the soft red surface (#8A2E1C on #FBE9E4 is 7.2:1). */
export const WRONG_TEXT = 'text-[#8A2E1C] dark:text-[#F2B5A5]';
/** Body text on the soft red surface (#5A2A20 on #FBE9E4 is 11:1). */
export const WRONG_BODY = 'text-[#5A2A20] dark:text-[#F6D3C9]';
