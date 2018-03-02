export const randomChoice = (choices: Array<number>): number => {
  const index = Math.floor(Math.random() * choices.length);
  return choices[index];
};
