/**
 * The AHS display face draws a capital O as a small dotted "o". Its round O is the lowercase o
 * (with the ss04 set, which the display styles turn on), and lowercase letters are drawn as
 * capitals anyway. So text set in that face swaps capital O for o, and looks right everywhere.
 * Page titles and metadata keep the original spelling.
 */
export const ahs = (text: string) => text.replace(/O/g, 'o');
