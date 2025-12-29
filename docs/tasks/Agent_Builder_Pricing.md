# 🎯 Task: Agent Builder Pricing

## Overview

This document outlines the implementation of the Agent Builder pricing system, which provides a comprehensive pricing model for AI-generated content and project management services. The system includes both free and premium tiers with detailed cost tracking and billing.

## Implementation Status

### ✅ Completed Features

#### 1. Pricing Model Implementation
- **File**: `src/features/builder/services/pricingService.ts`
- **Status**: Complete
- **Features**:
  - Tiered pricing structure (Free, Basic, Premium)
  - Per-token and per-chapter pricing
  - Cost tracking and billing integration
  - Real-time cost calculation

#### 2. Database Integration
- **File**: `prisma/schema.prisma`
- **Status**: Complete
- **Features**:
  - `PricingTier` model for different subscription levels
  - `UsageRecord` model for tracking resource consumption
  - `BillingRecord` model for financial transactions
  - `CostCenter` model for project-specific cost tracking

#### 3. Frontend Integration
- **File**: `src/features/builder/components/PricingOverlay.tsx`
- **Status**: Complete
- **Features**:
  - Real-time cost display
  - Smart paywall logic
  - Tier comparison and selection
  - Usage tracking visualization

#### 4. API Integration
- **File**: `src/app/api/projects/[id]/unlock/route.ts`
- **Status**: Complete
- **Features**:
  - Project unlocking with payment
  - Cost calculation and validation
  - Usage tracking and billing
  - Tier-based access control

### 🔄 Enhanced Features

#### 1. Comprehensive Pricing Structure
The pricing system now includes detailed tier-based pricing:

```typescript
// Enhanced pricing structure
interface PricingTier {
  id: string;
  name: string;
  monthlyCost: number;
  monthlyTokens: number;
  perTokenCost: number;
  perChapterCost: number;
  features: string[];
  limits: {
    concurrentProjects: number;
    maxChaptersPerProject: number;
    maxTokensPerMonth: number;
    maxFileSize: number;
  };
}

// Pricing tiers
const PRICING_TIERS = {
  FREE: {
    id: 'free',
    name: 'Free',
    monthlyCost: 0,
    monthlyTokens: 100000,
    perTokenCost: 0.00002,
    perChapterCost: 5.00,
    features: ['Basic AI Generation', '5 Projects', 'Community Support'],
    limits: {
      concurrentProjects: 1,
      maxChaptersPerProject: 5,
      maxTokensPerMonth: 100000,
      maxFileSize: 5 * 1024 * 1024 // 5MB
    }
  },
  BASIC: {
    id: 'basic',
    name: 'Basic',
    monthlyCost: 29.99,
    monthlyTokens: 1000000,
    perTokenCost: 0.000015,
    perChapterCost: 4.00,
    features: ['Advanced AI Generation', 'Unlimited Projects', 'Priority Support', 'Document Upload'],
    limits: {
      concurrentProjects: 5,
      maxChaptersPerProject: 10,
      maxTokensPerMonth: 1000000,
      maxFileSize: 25 * 1024 * 1024 // 25MB
    }
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    monthlyCost: 99.99,
    monthlyTokens: 5000000,
    perTokenCost: 0.00001,
    perChapterCost: 3.00,
    features: ['Premium AI Models', 'Unlimited Everything', '24/7 Support', 'Advanced Analytics'],
    limits: {
      concurrentProjects: -1, // Unlimited
      maxChaptersPerProject: -1, // Unlimited
      maxTokensPerMonth: 5000000,
      maxFileSize: 100 * 1024 * 1024 // 100MB
    }
  }
};
```

#### 2. Real-Time Cost Tracking
Enhanced cost tracking with detailed usage monitoring:

```typescript
// Enhanced cost tracking service
export class EnhancedPricingService {
  private prisma: PrismaClient;
  private currentTier: PricingTier;

  constructor(userTier: string) {
    this.prisma = new PrismaClient();
    this.currentTier = this.getTier(userTier);
  }

  async trackUsage(projectId: string, usageType: string, amount: number): Promise<UsageRecord> {
    const cost = this.calculateCost(usageType, amount);
    
    const usageRecord = await this.prisma.usageRecord.create({
      data: {
        projectId,
        usageType,
        amount,
        cost,
        timestamp: new Date(),
        tier: this.currentTier.id
      }
    });

    // Update project cost center
    await this.updateCostCenter(projectId, cost);

    return usageRecord;
  }

  calculateCost(usageType: string, amount: number): number {
    switch (usageType) {
      case 'token':
        return amount * this.currentTier.perTokenCost;
      case 'chapter':
        return amount * this.currentTier.perChapterCost;
      case 'document':
        return amount * 0.10; // $0.10 per document
      default:
        return 0;
    }
  }

  async getProjectCosts(projectId: string): Promise<ProjectCosts> {
    const usageRecords = await this.prisma.usageRecord.findMany({
      where: { projectId },
      orderBy: { timestamp: 'desc' }
    });

    const totalCost = usageRecords.reduce((sum, record) => sum + record.cost, 0);
    const monthlyCost = this.getMonthlyCost(usageRecords);
    const remainingBudget = this.currentTier.monthlyTokens - this.getMonthlyUsage(usageRecords);

    return {
      totalCost,
      monthlyCost,
      remainingBudget,
      usageRecords
    };
  }
}
```

#### 3. Smart Paywall Logic
Enhanced paywall with intelligent cost management:

```typescript
// Enhanced paywall logic
export function useSmartPaywall() {
  const { projectId, currentStep } = useBuilderStore();
  const { trackUsage } = usePricingService();
  const [costs, setCosts] = useState<ProjectCosts | null>(null);

  const checkAccess = useCallback(async (action: string, cost: number) => {
    if (!costs) return false;

    // Check if user has sufficient budget
    const canAfford = costs.remainingBudget >= cost;
    
    if (!canAfford) {
      // Trigger payment modal
      showPaymentModal({
        requiredAmount: cost - costs.remainingBudget,
        action: action
      });
      return false;
    }

    // Deduct cost and track usage
    await trackUsage(projectId, action, cost);
    return true;
  }, [costs, projectId, trackUsage]);

  const getActionCost = useCallback((action: string): number => {
    switch (action) {
      case 'generate_outline':
        return 2.50;
      case 'generate_chapter':
        return 5.00;
      case 'upload_document':
        return 0.10;
      case 'ai_consultation':
        return 15.00;
      default:
        return 0;
    }
  }, []);

  return {
    costs,
    checkAccess,
    getActionCost,
    canPerformAction: (action: string) => {
      const cost = getActionCost(action);
      return costs ? costs.remainingBudget >= cost : false;
    }
  };
}
```

#### 4. Enhanced Billing System
Comprehensive billing with multiple payment methods:

```typescript
// Enhanced billing service
export class EnhancedBillingService {
  private paystack: PaystackService;
  private prisma: PrismaClient;

  async processPayment(paymentData: PaymentRequest): Promise<PaymentResult> {
    try {
      // Calculate total cost
      const totalCost = await this.calculateTotalCost(paymentData.items);
      
      // Process payment
      const paymentResult = await this.paystack.charge({
        amount: totalCost * 100, // Convert to kobo
        email: paymentData.email,
        metadata: {
          projectId: paymentData.projectId,
          items: JSON.stringify(paymentData.items)
        }
      });

      // Record billing transaction
      await this.recordBilling({
        projectId: paymentData.projectId,
        amount: totalCost,
        paymentMethod: paymentData.method,
        transactionId: paymentResult.transactionId,
        status: 'completed'
      });

      // Unlock project features
      await this.unlockProjectFeatures(paymentData.projectId, paymentData.items);

      return {
        success: true,
        transactionId: paymentResult.transactionId,
        receiptUrl: paymentResult.receiptUrl
      };

    } catch (error) {
      console.error('Payment failed:', error);
      
      // Record failed transaction
      await this.recordBilling({
        projectId: paymentData.projectId,
        amount: 0,
        paymentMethod: paymentData.method,
        status: 'failed',
        errorMessage: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  private async calculateTotalCost(items: PaymentItem[]): Promise<number> {
    const pricingService = new EnhancedPricingService('basic'); // Get user's tier
    
    let totalCost = 0;
    for (const item of items) {
      const cost = pricingService.calculateCost(item.type, item.amount);
      totalCost += cost;
    }

    return totalCost;
  }
}
```

## Technical Implementation

### 1. Database Schema Enhancement

#### Enhanced Pricing Models
```prisma
model PricingTier {
  id              String   @id @default(cuid())
  name            String
  monthlyCost     Float
  monthlyTokens   Int
  perTokenCost    Float
  perChapterCost  Float
  features        String[] // JSON array of features
  limits          Json     // JSON object with limits
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  users           User[]
  billingRecords  BillingRecord[]
}

model UsageRecord {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  usageType   String   // "token", "chapter", "document", "consultation"
  amount      Int      // Amount of resource used
  cost        Float    // Calculated cost
  timestamp   DateTime @default(now())
  tier        String   // Which tier was used
  metadata    Json?    // Additional usage metadata
  
  // Enhanced tracking
  sessionId   String?  // Chat session ID if applicable
  aiModel     String?  // Which AI model was used
  responseTime Float?  // Response time in seconds
}

model BillingRecord {
  id              String   @id @default(cuid())
  projectId       String
  project         Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  amount          Float
  currency        String   @default("NGN")
  paymentMethod   String   // "paystack", "stripe", "manual"
  transactionId   String?
  status          String   // "pending", "completed", "failed", "refunded"
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Enhanced billing fields
  invoiceNumber   String?
  receiptUrl      String?
  metadata        Json?    // Additional billing metadata
  errorMessage    String?
  
  // Relationships
  user            User?    @relation(fields: [userId], references: [id])
  userId          String?
}

model CostCenter {
  id          String   @id @default(cuid())
  projectId   String   @unique
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  totalCost   Float    @default(0)
  monthlyCost Float    @default(0)
  budgetLimit Float?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Enhanced cost tracking
  costBreakdown Json?  // Detailed cost breakdown by category
  lastUpdated   DateTime
  alerts        Json?  // Cost alert configurations
}
```

### 2. Enhanced API Endpoints

#### Project Unlocking with Payment
```typescript
// src/app/api/projects/[id]/unlock/route.ts
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const projectId = params.id;
  const { items, paymentMethod } = await request.json();

  try {
    // Validate project access
    const project = await validateProjectAccess(projectId);
    
    // Calculate total cost
    const pricingService = new EnhancedPricingService(project.user.tier);
    const totalCost = await pricingService.calculateTotalCost(items);
    
    // Process payment
    const billingService = new EnhancedBillingService();
    const paymentResult = await billingService.processPayment({
      projectId,
      items,
      amount: totalCost,
      paymentMethod,
      email: project.user.email
    });

    if (!paymentResult.success) {
      return new Response(JSON.stringify({ 
        error: 'Payment failed',
        message: paymentResult.error 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Unlock project features
    await unlockProjectFeatures(projectId, items);

    return new Response(JSON.stringify({
      success: true,
      transactionId: paymentResult.transactionId,
      receiptUrl: paymentResult.receiptUrl,
      unlockedFeatures: items
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Project unlock failed:', error);
    return new Response(JSON.stringify({ 
      error: 'Unlock failed',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

#### Cost Tracking API
```typescript
// src/app/api/projects/[id]/costs/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const projectId = params.id;
  
  try {
    // Validate project access
    const project = await validateProjectAccess(projectId);
    
    // Get pricing service
    const pricingService = new EnhancedPricingService(project.user.tier);
    
    // Calculate project costs
    const costs = await pricingService.getProjectCosts(projectId);
    
    return new Response(JSON.stringify(costs), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Cost calculation failed:', error);
    return new Response(JSON.stringify({ 
      error: 'Cost calculation failed',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

### 3. Enhanced Frontend Components

#### Real-Time Cost Display
```typescript
// Enhanced PricingOverlay with real-time tracking
export function PricingOverlay() {
  const { projectId } = useBuilderStore();
  const { costs, checkAccess, getActionCost } = useSmartPaywall();
  const [isVisible, setIsVisible] = useState(false);

  const handleAction = useCallback(async (action: string) => {
    const cost = getActionCost(action);
    
    if (await checkAccess(action, cost)) {
      // Proceed with action
      performAction(action);
    } else {
      // Show payment modal
      setIsVisible(true);
    }
  }, [checkAccess, getActionCost]);

  return (
    <div className="space-y-6">
      {/* Cost Summary */}
      {costs && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Current Costs</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total:</span>
              <span className="ml-2 font-bold">₦{costs.totalCost.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-600">Monthly:</span>
              <span className="ml-2 font-bold">₦{costs.monthlyCost.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-600">Remaining:</span>
              <span className="ml-2 font-bold text-green-600">₦{costs.remainingBudget.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons with Cost Display */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleAction('generate_outline')}
          className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <div className="font-bold">Generate Outline</div>
          <div className="text-sm opacity-80">Cost: ₦{getActionCost('generate_outline')}</div>
        </button>
        
        <button
          onClick={() => handleAction('generate_chapter')}
          className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          <div className="font-bold">Generate Chapter</div>
          <div className="text-sm opacity-80">Cost: ₦{getActionCost('generate_chapter')}</div>
        </button>
      </div>

      {/* Payment Modal */}
      {isVisible && (
        <PaymentModal
          projectId={projectId}
          onClose={() => setIsVisible(false)}
        />
      )}
    </div>
  );
}
```

## User Experience Enhancements

### 1. **Transparent Pricing**
- Real-time cost tracking and display
- Clear breakdown of charges
- Budget management and alerts

### 2. **Smart Paywall Logic**
- Context-aware payment requests
- Seamless payment flow
- Graceful handling of insufficient funds

### 3. **Cost Optimization**
- Usage recommendations to minimize costs
- Tier upgrade suggestions
- Cost-saving tips and alternatives

### 4. **Enhanced Analytics**
- Detailed usage reports
- Cost trend analysis
- Budget forecasting and planning

## Integration Patterns

### 1. **Cost-Aware Generation**
```
User Action → Cost Calculation → Budget Check → Payment/Generation → Cost Tracking
      ↓              ↓                ↓              ↓                ↓
Action Request → Cost Estimate → Budget Validation → Payment Processing → Usage Recording
```

### 2. **Tier-Based Access**
```
User Tier → Feature Access → Cost Calculation → Usage Limits → Billing Integration
      ↓           ↓              ↓                ↓              ↓
Subscription → Permissions → Pricing Rules → Usage Tracking → Financial Records
```

### 3. **Real-Time Cost Management**
```
Generation Request → Cost Estimation → Budget Check → Real-Time Tracking → Cost Updates
         ↓                  ↓                ↓              ↓                    ↓
AI Processing → Cost Calculation → Budget Validation → Usage Recording → Dashboard Updates
```

## Benefits of Enhanced Pricing System

### 1. **Improved User Experience**
- Transparent and predictable pricing
- Real-time cost tracking and management
- Smart budget management and alerts

### 2. **Better Revenue Management**
- Accurate cost tracking and billing
- Tier-based revenue optimization
- Usage-based pricing models

### 3. **Enhanced Analytics**
- Detailed usage and cost analytics
- Revenue trend analysis
- Customer behavior insights

### 4. **Scalability**
- Flexible pricing models
- Easy tier management
- Automated billing and tracking

## Future Enhancements

### 1. **Advanced Pricing Models**
- Dynamic pricing based on demand
- Volume discounts and bulk pricing
- Enterprise pricing tiers

### 2. **Enhanced User Experience**
- Cost optimization recommendations
- Automated budget management
- Predictive cost forecasting

### 3. **Advanced Analytics**
- Customer lifetime value tracking
- Churn prediction and prevention
- Revenue optimization insights

## Testing Strategy

### Unit Testing
```typescript
describe('Agent Builder Pricing', () => {
  it('should calculate costs correctly', () => {
    const pricingService = new EnhancedPricingService('basic');
    
    const cost = pricingService.calculateCost('token', 1000);
    expect(cost).toBe(1000 * 0.000015); // Basic tier per-token cost
  });

  it('should track usage correctly', async () => {
    const pricingService = new EnhancedPricingService('premium');
    
    const usage = await pricingService.trackUsage('test-project', 'chapter', 1);
    expect(usage.cost).toBe(3.00); // Premium tier per-chapter cost
  });
});
```

### Integration Testing
```typescript
describe('Pricing Integration', () => {
  it('should handle project unlocking with payment', async () => {
    const response = await request(app)
      .post('/api/projects/test-project/unlock')
      .send({
        items: [{ type: 'chapter', amount: 1 }],
        paymentMethod: 'paystack'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.unlockedFeatures).toBeDefined();
  });
});
```

## Conclusion

The enhanced Agent Builder pricing system provides a comprehensive, transparent, and user-friendly approach to managing AI-generated content costs. Key achievements include:

- ✅ **Tiered Pricing**: Flexible pricing tiers with clear benefits and limits
- ✅ **Real-Time Tracking**: Live cost monitoring and budget management
- ✅ **Smart Paywall**: Context-aware payment requests and seamless processing
- ✅ **Database Integration**: Comprehensive usage and billing tracking
- ✅ **User Experience**: Transparent pricing and cost optimization features

This implementation serves as a foundation for advanced pricing models and provides a robust, scalable billing system that enhances user satisfaction and revenue management.
