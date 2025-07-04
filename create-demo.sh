#!/bin/bash

# Create a clean demo environment
echo "🔧 Setting up demo environment..."

# Create demo directory
mkdir -p demo-showcase
cd demo-showcase

# Create a sample TypeScript file
cat > calculator.ts << 'EOF'
export function add(a: number, b: number): number {
    return a + b;
}

export function multiply(a: number, b: number): number {
    return a * b;
}

export class Calculator {
    private history: number[] = [];
    
    public calculate(operation: string, a: number, b: number): number {
        let result: number;
        
        switch (operation) {
            case '+':
                result = a + b;
                break;
            case '*':
                result = a * b;
                break;
            default:
                throw new Error('Unsupported operation');
        }
        
        this.history.push(result);
        return result;
    }
    
    public getHistory(): number[] {
        return [...this.history];
    }
}
EOF

echo "✅ Demo files created in demo-showcase directory"
