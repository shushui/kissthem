# 🧪 Backend Testing Guide

This document describes the comprehensive testing suite for the "Kiss them!" backend API.

## 📋 **Test Coverage**

### **API Endpoints Tested**
- ✅ **Health Check**: `/health` - Basic service status
- ✅ **Authentication**: `/api/oauth-client-id` - OAuth client configuration
- ✅ **Image Processing**: `/api/process-image` - AI-powered photo enhancement
- ✅ **Gallery Management**: `/api/gallery` - Photo listing and management
- ✅ **Photo Operations**: `/api/photos/:id` - Individual photo operations

### **Service Layer Tests**
- ✅ **ImageService**: AI processing, storage, database operations
- ✅ **GalleryService**: Photo retrieval, deletion, gallery management
- ✅ **AuthService**: OAuth configuration and validation

### **Integration Tests**
- ✅ **End-to-End**: Complete API flow testing
- ✅ **Error Handling**: Graceful failure scenarios
- ✅ **Data Validation**: Request/response validation
- ✅ **Authentication**: Guard and middleware testing

## 🚀 **Running Tests**

### **Quick Start**
```bash
cd backend
./test-runner.sh
```

### **Manual Test Commands**

#### **Unit Tests (Fast)**
```bash
npm test
```

#### **Unit Tests with Coverage**
```bash
npm run test:cov
```

#### **E2E Integration Tests**
```bash
npm run test:e2e
```

#### **Watch Mode (Development)**
```bash
npm run test:watch
```

#### **All Tests**
```bash
npm run test && npm run test:e2e
```

## 🧩 **Test Structure**

```
backend/
├── src/
│   ├── test/
│   │   ├── test-utils.ts          # Mock data and utilities
│   │   └── app.e2e-spec.ts        # E2E integration tests
│   ├── health.controller.spec.ts   # Health endpoint tests
│   ├── modules/
│   │   ├── auth/
│   │   │   └── auth.controller.spec.ts    # Auth tests
│   │   ├── image/
│   │   │   └── image.service.spec.ts      # Image processing tests
│   │   └── gallery/
│   │       └── gallery.controller.spec.ts # Gallery tests
│   └── ...
├── test-runner.sh                  # Interactive test runner
└── TESTING.md                      # This file
```

## 🔍 **Test Categories**

### **1. Unit Tests**
- **Controllers**: API endpoint behavior and response formatting
- **Services**: Business logic and external service integration
- **Validation**: Request/response data validation
- **Error Handling**: Graceful failure scenarios

### **2. Integration Tests**
- **API Flow**: Complete request/response cycles
- **Service Integration**: Cross-service communication
- **Database Operations**: CRUD operations with mocked services
- **Authentication**: Guard and middleware integration

### **3. Mock Services**
- **Google Cloud**: Firestore, Storage, Secret Manager
- **AI Services**: Gemini API responses
- **External APIs**: OAuth and third-party services

## 📊 **Test Data**

### **Mock Users**
```typescript
const mockUser = {
  id: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User',
  picture: 'https://example.com/avatar.jpg'
};
```

### **Mock Photos**
```typescript
const mockPhoto = {
  id: 'test-photo-123',
  userId: mockUser.id,
  originalUrl: 'https://storage.example.com/original.jpg',
  generatedUrl: 'https://storage.example.com/generated.jpg',
  photoName: 'Test Photo',
  prompt: 'Add cute kisses',
  aiResponse: 'AI processed successfully'
};
```

### **Mock Requests**
```typescript
const mockProcessImageRequest = {
  image: 'data:image/jpeg;base64,...',
  prompt: 'Add cute kisses to this photo'
};
```

## 🎯 **Test Scenarios**

### **Image Processing Tests**
- ✅ **Successful Processing**: AI generates enhanced image
- ✅ **Fallback Handling**: AI fails, saves original image
- ✅ **Error Scenarios**: Storage, database, API failures
- ✅ **Validation**: Required fields, image formats
- ✅ **Large Files**: Performance with large images

### **Gallery Management Tests**
- ✅ **Photo Listing**: Retrieve user photos
- ✅ **Photo Deletion**: Remove individual photos
- ✅ **Gallery Deletion**: Clear entire user gallery
- ✅ **Empty States**: Handle no photos scenario
- ✅ **Error Handling**: Database connection issues

### **Authentication Tests**
- ✅ **OAuth Configuration**: Client ID retrieval
- ✅ **Secret Management**: API key handling
- ✅ **Error Scenarios**: Missing secrets, invalid keys
- ✅ **Response Format**: Consistent API responses

## 🐛 **Debugging Tests**

### **Common Issues**

#### **Test Failures**
```bash
# Run with verbose output
npm test -- --verbose

# Run specific test file
npm test -- image.service.spec.ts

# Run with coverage to see what's tested
npm run test:cov
```

#### **E2E Test Issues**
```bash
# Check if backend is running
curl http://localhost:8080/health

# Run E2E tests with debug
npm run test:e2e -- --verbose
```

### **Test Logs**
- **Console Output**: Test execution details
- **Coverage Reports**: Code coverage analysis
- **Error Messages**: Detailed failure information
- **Mock Data**: Verify test data setup

## 🔧 **Adding New Tests**

### **1. Create Test File**
```bash
# For controller tests
touch src/modules/example/example.controller.spec.ts

# For service tests
touch src/modules/example/example.service.spec.ts
```

### **2. Follow Test Pattern**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ExampleController } from './example.controller';

describe('ExampleController', () => {
  let controller: ExampleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExampleController],
    }).compile();

    controller = module.get<ExampleController>(ExampleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Add your test cases here
});
```

### **3. Update Test Runner**
Add new test files to the appropriate test suites in `test-runner.sh`.

## 📈 **Test Metrics**

### **Coverage Goals**
- **Statements**: >90%
- **Branches**: >85%
- **Functions**: >90%
- **Lines**: >90%

### **Performance Targets**
- **Unit Tests**: <30 seconds
- **E2E Tests**: <2 minutes
- **Coverage Generation**: <1 minute

## 🎉 **Success Criteria**

Tests are considered successful when:
- ✅ All unit tests pass
- ✅ All integration tests pass
- ✅ Coverage meets minimum thresholds
- ✅ No critical security vulnerabilities
- ✅ Performance targets are met
- ✅ Error scenarios are properly handled

---

**Happy Testing! 🧪✨** 