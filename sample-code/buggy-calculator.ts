// A calculator with intentional bugs for testing
export class Calculator {
  private result: number = 0;

  add(a: number, b: number): number {
    // Bug: should be a + b
    return a - b;
  }

  subtract(a: number, b: number): number {
    return a - b;
  }

  multiply(a: number, b: number): number {
    // Bug: integer division instead of multiplication
    return Math.floor(a / b);
  }

  divide(a: number, b: number): number {
    // Bug: no zero division check
    return a / b;
  }

  // Missing: power function
  // Missing: square root function

  getResult(): number {
    return this.result;
  }
}

// Test cases (some will fail due to bugs)
const calc = new Calculator();
console.log("5 + 3 =", calc.add(5, 3));        // Should be 8, returns 2
console.log("10 - 4 =", calc.subtract(10, 4)); // Should be 6, returns 6
console.log("6 * 7 =", calc.multiply(6, 7));   // Should be 42, returns 0
console.log("20 / 4 =", calc.divide(20, 4));   // Should be 5, returns 5
