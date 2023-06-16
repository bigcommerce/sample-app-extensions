import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '../../../lib/auth';
import { getAppExtensions } from '@lib/appExtensions';
import { resolveSoa } from 'dns';

export default async function index(req: NextApiRequest, res: NextApiResponse) {
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
      body: JSON.stringify(getAppExtensions()),
    }
  );

  const data = await response.json();
  if (response.ok) {
    const edges = data?.data?.store?.appExtensions?.edges;
    res.status(200).json(edges);
  } else {
    res.status(response.status || 500).json(data);
  }
}
