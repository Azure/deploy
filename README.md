# Azure Deployment Action

This repository contains a GitHub Action for deploying and managing Azure
resources using ARM Templates or Bicep files. With this action, users can:

- Create resources through Azure Deployments.
- Manage environments with Azure Deployment Stacks, including creating and
  deleting resources.

This tool streamlines the deployment process, making it easier to manage Azure
resources directly from GitHub workflows.

## Usage

Deployment

```yaml
- name: Deployment
  uses: azure/deploy@v1
  with:
    operation: deployment
    type: create
    name: Microsoft.Deployment
    location: westus2
    scope: subscription
    subscription-id: 00000000-0000-0000-0000-000000000000
    template-file: ./main.bicep
    parameters: ./main.bicepparam
```

Deployment Stack

```yaml
- name: Deployment
  uses: azure/deploy@v1
  with:
    operation: deploymentStack
    type: create
    name: Development
    location: westus2
    scope: subscription
    subscription-id: 00000000-0000-0000-0000-000000000000
    template-file: ./main.bicep
    parameters: |
      {"count": { "value": "5"}, "runner": { "value": "${{ inputs.runner }}" }}
    action-on-unmanage: deleteAll
    deny-settings-mode: denyWriteAndDelete
```

## Dependencies

- [Login](https://github.com/azure/login): This action is used to authenticate
  the GitHub Actions workflow with Azure Resource Manager (ARM).
- [Checkout](https://github.com/actions/checkout): This action checks out the
  repository where the workflow is running onto the GitHub Actions runner.

## Contributing

This project welcomes contributions and suggestions. Most contributions require
you to agree to a Contributor License Agreement (CLA) declaring that you have
the right to, and actually do, grant us the rights to use your contribution. For
details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether
you need to provide a CLA and decorate the PR appropriately (e.g., status check,
comment). Simply follow the instructions provided by the bot. You will only need
to do this once across all repos using our CLA.

This project has adopted the
[Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the
[Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any
additional questions or comments.

## Trademarks

This project may contain trademarks or logos for projects, products, or
services. Authorized use of Microsoft trademarks or logos is subject to and must
follow
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must
not cause confusion or imply Microsoft sponsorship. Any use of third-party
trademarks or logos are subject to those third-party's policies.
