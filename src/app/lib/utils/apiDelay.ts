export const simulateApiDelay = () => {
  return new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
};

