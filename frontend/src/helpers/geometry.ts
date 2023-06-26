function randomNumberBetween(min: number, max: number) {
  return Math.random() * (max - min) + min
}

export { randomNumberBetween }
