# Deployment

**Create & Update**

```yaml
name: Deployment (Create)

on:
  push:
    branches:
      - main

permissions:
  contents: read
  id-token: write

jobs:
  deployment:
    name: "Deployment"
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
          operation: deployment
          type: create
          name: Development
          location: westus2
          scope: subscription
          subscription-id: 00000000-0000-0000-0000-000000000000
          template-file: ./main.bicep
          parameters-file: ./main.bicepparameters.json
```

**Validate & What-If**

```yaml
name: Deployment (Validate)

on:
  pull_request:
    branches:
      - main

permissions:
  contents: read
  id-token: write

jobs:
  deployment:
    name: "Validate"
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
          operation: deployment
          type: validate
          name: Development
          location: westus2
          scope: subscription
          subscription-id: 00000000-0000-0000-0000-000000000000
          template-file: ./main.bicep
          parameters-file: ./main.bicepparam

      - name: What-If
        uses: azure/deploy@v1
        with:
          operation: deployment
          type: whatIf
          name: Development
          location: westus2
          scope: subscription
          subscription-id: 00000000-0000-0000-0000-000000000000
          template-file: ./main.bicep
          parameters-file: ./main.bicepparam
```
