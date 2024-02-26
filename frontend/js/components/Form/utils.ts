export const normalizeNumberInput = val => (val && !Number.isNaN(Number(val)) ? Number(val) : 0)
