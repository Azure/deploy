# Deployment Stacks

**Create**

```yaml
name: Stacks (Create)

on:
  push:
    branches:
      - main

permissions:
  contents: read
  id-token: write

jobs:
  deployment:
    name: "Stacks"
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Login
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Create
        uses: azure/deploy@v1
        with:
          operation: deploymentStack
          type: create
          name: Development
          location: westus2
          scope: subscription
          subscription-id: 00000000-0000-0000-0000-000000000000
          template-file: ./main.bicep
          parameters-file: ./main.bicepparameters.json
          action-on-unmanage-resources: delete
          action-on-unmanage-resourcegroups: delete
          deny-settings-mode: denyWriteAndDelete
          description: "Development Environment"
```

**Validate**

```yaml
name: Stacks (Validate)

on:
  pull_request:
    branches:
      - main

permissions:
  contents: read
  id-token: write

jobs:
  deployment:
    name: "Stacks"
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Login
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Validate
        uses: azure/deploy@v1
        with:
          operation: deploymentStack
          type: validate
          name: Development
          location: westus2
          scope: subscription
          subscription-id: 00000000-0000-0000-0000-000000000000
          template-file: ./main.bicep
          parameters-file: ./main.bicepparameters.json
```

**Delete**

```yaml
name: Stacks (Delete)

on: workflow_dispatch

permissions:
  contents: read
  id-token: write

jobs:
  deployment:
    name: "Stacks"
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Login
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Delete
        uses: azure/deploy@v1
        with:
          operation: deploymentStack
          type: delete
          name: Development
          location: westus2
          scope: subscription
          subscription-id: 00000000-0000-0000-0000-000000000000
          template-file: ./main.bicep
          parameters-file: ./main.bicepparameters.json
```
