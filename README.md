# Azure Deployment Action

> [!WARNING]
> ## ⚠️ This repository is currently under development, and not ready for usage ⚠️

This repository offers a GitHub Action for automating the deployment and management of Azure resources using ARM Templates or Bicep files. It integrates smoothly into GitHub workflows, allowing developers to manage Azure infrastructure directly within their CI/CD pipelines.

With this action, users can:

- Deploy resources via Azure Deployments or manage environments using Deployment Stacks.
- Perform various operations like creating, validating, and previewing resource changes using the "What If" feature.

**Key Configuration Options**

- **Execution Type (`type`)**: Specifies the mode of execution, whether deploying individual resources (`deployment`) or managing full environment stacks (`deploymentStack`).
- **Operations (`operation`)**: Users can create, validate, or preview changes before deploying resources. For deployment stacks, deletion and lifecycle management are also supported.
- **Scope (`scope`)**: Defines the scope at which resources are deployed, such as tenant, management group, subscription, or resource group.
- **Template & Parameters**: Paths to the ARM or Bicep templates (`template-file`) and associated parameter files (`parameters-file`), or the URI if they are hosted remotely (`template-uri`).
- **What If Analysis**: Leverage the what-if operation to preview potential changes before applying them, including options to exclude certain change types (`what-if-exclude-change-type`).
- **Unmanaged Resource Actions**: Specify actions to take on unmanaged resources (`action-on-unmanage-resources`) or entire resource groups (`action-on-unmanage-resourcegroups`), such as deleting or detaching them.

This action simplifies Azure resource management, providing flexibility through various configurations, making it suitable for automating both simple and complex infrastructure scenarios.

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
    parameters-file: ./main.bicepparam
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
    parameters-file: ./main.bicepparam
    action-on-unmanage-resources: delete
    action-on-unmanage-resourcegroups: delete
    deny-settings-mode: denyWriteAndDelete
```

For end-to-end workflow examples, please see [Deployment](./examples/DEPLOYMENT.md) & [Deployment Stacks](./examples/STACKS.md).

## Dependencies

- [Login](https://github.com/azure/login): This action is used to authenticate
  the GitHub Actions workflow with Azure Resource Manager (ARM).
- [Checkout](https://github.com/actions/checkout): This action checks out the
  repository where the workflow is running onto the GitHub Actions runner.

## Inputs

| Name                                 | Description                                                         | Allowed Values                                                                                                                                   |
| ------------------------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `type`                               | Specifies the execution type.                                       | `deployment`, `deploymentStack`                                                                                                                  |
| `operation`                          | Specifies the operation to perform.                                 | deployment: `create`, `validate`, `whatIf` <br> deploymentStack: `create`, `delete`, `validate`                                                  |
| `name`                               | Specifies the name of the deployment or deploymentStack.            | Free-text                                                                                                                                        |
| `location`                           | Specifies the location of the deployment or deploymentStack.        | Free-text                                                                                                                                        |
| `scope`                              | Specifies the scope of the deployment or deploymentStack.           | deployment: `tenant`, `managementGroup`, `subscription`, `resourceGroup` <br> deploymentStack: `managementGroup`, `subscription`,`resourceGroup` |
| `tenant-id`                          | Specifies the tenant ID.                                            | Free-text                                                                                                                                        |
| `management-group-id`                | Specifies the management group ID.                                  | Free-text                                                                                                                                        |
| `subscription-id`                    | Specifies the subscription ID.                                      | Free-text                                                                                                                                        |
| `resource-group-name`                | Specifies the resource group name.                                  | Free-text                                                                                                                                        |
| `template-file`                      | Specifies the path to the template file.                            | Free-text                                                                                                                                        |
| `template-spec`                      | Specifies the template spec resource ID.                            | Free-text                                                                                                                                        |
| `template-uri`                       | Specifies the HTTP URI of the template.                             | Free-text                                                                                                                                        |
| `parameters-file`                    | Specifies the path to the parameters file.                          | Free-text                                                                                                                                        |
| `parameters`                         | Specifies parameters in a JSON format.                              | Free-text                                                                                                                                        |
| `what-if-exclude-change-types`       | Specifies the change types to exclude from the "What If" operation. | Free-text                                                                                                                                        |
| `action-on-unmanage-resources`       | Specifies the action to take on unmanaged resources.                | `delete`, `detach`                                                                                                                               |
| `action-on-unmanage-resourcegroups`  | Specifies the action to take on unmanaged resource groups.          | `delete`, `detach`                                                                                                                               |
| `action-on-unmanage-managementgroup` | Specifies the action to take on unmanaged management groups.        | `delete`, `detach`                                                                                                                               |
| `deny-settings-mode`                 | Specifies the mode of the deny settings.                            | `denyDelete`, `denyWriteAndDelete`, `none`                                                                                                       |
| `deny-settings-excluded-action`      | Specifies the excluded action for the deny settings.                | Free-text                                                                                                                                        |
| `deny-settings-excluded-principals`  | Specifies the excluded principals for the deny settings.            | Free-text                                                                                                                                        |
| `bypass-stack-out-of-sync-error`     | Specifies whether to bypass the stack out of sync error.            | `true`, `false`                                                                                                                                  |
| `description`                        | Specifies the description of the deploymentStack.                   | Free-text                                                                                                                                        |
| `tags`                               | Specifies the tags for the deploymentStack.                         | Free-text                                                                                                                                        |

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
