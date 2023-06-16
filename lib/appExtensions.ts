import { GraphQLQuery } from '@types';

// Builds the GraphQL query required to retrieve all App Extensions installed on a store
export function getAppExtensions() {
  const body = {
    query: `
            query {
                store {
                    appExtensions {
                        edges {
                            node {
                                id 
                                label {
                                  defaultValue
                                }
                                model
                                context
                            }
                        }
                    }
                }
            }`,
  };

  return body;
}

//  Builds the GraphQL mutation required to create a new App Extension
export function createAppExtension(title: string, model: string, url: string): GraphQLQuery {
  const body = {
    query: `
        mutation AppExtension($input: CreateAppExtensionInput!) {
            appExtension {
                createAppExtension(input: $input) {
                appExtension {
                    id
                    context
                    label {
                    defaultValue
                    locales {
                        value
                        localeCode
                        }
                    }
                    model
                    url
                    }
                }
            }
        }`,
    variables: {
      input: {
        context: 'PANEL',
        model: model,
        url: url,
        label: {
          defaultValue: title,
          locales: [
            {
              value: title,
              localeCode: 'en-US',
            },
          ],
        },
      },
    },
  };

  const requestBody = {
    query: body.query,
    variables: body.variables,
  };

  return requestBody;
}

//  Builds the GraphQL mutation required to create a new App Extension
export function deleteAppExtension(id: string | string[]): GraphQLQuery {
  const body = {
    query: `
        mutation DeleteAppExtension($input: DeleteAppExtensionInput!) {
            appExtension {
                deleteAppExtension(input: $input) {
                  deletedAppExtensionId
                }
            }
        }`,
    variables: {
      input: {
        id: id
      },
    }
  };

  const requestBody = {
    query: body.query,
    variables: body.variables,
  };

  return requestBody;
}
