import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '../../../lib/auth';
import { createAppExtension, deleteAppExtension } from '@lib/appExtensions';
import { GraphQLQuery } from '@types';

export default async function index(req: NextApiRequest, res: NextApiResponse) {

  const queryAppExtensions = async (json: GraphQLQuery) => {
    const { accessToken, storeHash } = await getSession(req);

    const response = await fetch(
      `https://api.bigcommerce.com/stores/${storeHash}/graphql`,
      {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'x-auth-token': accessToken,
        },
        body: JSON.stringify(json),
      }
    );

    const data = await response.json();
    if (response.ok) {
      res.status(200).json(data);
    } else {
      res.status(response.status || 500).json(data);
    }
  }

  const {
    body,
    method,
  } = req;

  switch (method) {
    case 'POST':
      const { title, model, url } = body;
      return queryAppExtensions(createAppExtension(title, model, url));
      break;
    case 'DELETE':
      const { id } = body;
      return queryAppExtensions(deleteAppExtension(id));
      break;
    default:
      res.setHeader('Allow', ['POST', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }

}
