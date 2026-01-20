# GymRx E2E Tests with Maestro

This directory contains end-to-end tests for the GymRx workout tracking app using Maestro.

## Prerequisites

Install Maestro:
```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

## Running Tests

### Run a single test:
```bash
maestro test .maestro/<test-name>.yaml
```

### Run all tests:
```bash
maestro test .maestro/
```

### Run regression suite (recommended for CI):
```bash
maestro test .maestro/regression-suite.yaml
```

### Run full app flow (comprehensive):
```bash
maestro test .maestro/full-app-flow.yaml
```

## Test Files

### Core Flows
| Test | Description |
|------|-------------|
| `full-app-flow.yaml` | Comprehensive test covering all major features |
| `regression-suite.yaml` | Quick regression test for CI/CD |
| `navigation-flow.yaml` | Tests navigation between all tabs and screens |

### Workout Tests
| Test | Description |
|------|-------------|
| `create-workout-flow.yaml` | Creating a new workout template |
| `edit-workout-exercises-flow.yaml` | Adding/removing exercises from a workout |
| `delete-workout-flow.yaml` | Deleting workout templates |
| `log-workout-flow.yaml` | Starting and completing a workout |
| `log-workout-cancel-flow.yaml` | Canceling a workout in progress |
| `log-workout-input-test.yaml` | Tests input handling doesn't trigger premature completion |
| `complete-workout-flow.yaml` | Full workout completion flow |
| `add-remove-sets-flow.yaml` | Adding and removing sets during logging |

### Exercise Tests
| Test | Description |
|------|-------------|
| `exercises-flow.yaml` | Browsing and searching exercises |
| `create-custom-exercise-flow.yaml` | Creating a custom exercise type |
| `edit-exercise-flow.yaml` | Editing exercise details |
| `exercise-analytics-flow.yaml` | Viewing exercise analytics and history |

### History & Analytics Tests
| Test | Description |
|------|-------------|
| `history-flow.yaml` | Viewing workout history |
| `workout-detail-flow.yaml` | Viewing completed workout details |
| `workout-analytics-flow.yaml` | Viewing workout analytics |

## Writing New Tests

### Basic Structure
```yaml
appId: com.gymrx.app

---
- launchApp
- waitForAnimationToEnd

# Your test steps here
- tapOn: "Element Text"
- assertVisible: "Expected Text"
```

### Common Commands
- `tapOn` - Tap on an element
- `longPressOn` - Long press on an element
- `inputText` - Enter text in a focused field
- `hideKeyboard` - Hide the keyboard
- `assertVisible` - Assert element is visible
- `assertNotVisible` - Assert element is not visible
- `waitForAnimationToEnd` - Wait for animations
- `scrollUntilVisible` - Scroll until element is found
- `back` - Press back button
- `runFlow` - Conditional execution

### Tips
1. Always use `waitForAnimationToEnd` after navigation
2. Use `hideKeyboard` after text input
3. Use conditional flows (`runFlow when:`) for handling variable states
4. Clean up test data at the end of tests
5. Use `scrollUntilVisible` for elements that might be off-screen
