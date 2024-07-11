import { NextApiRequest, NextApiResponse } from 'next';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
    uri: 'https://testnet.fuel.network/v1/graphql', // Replace with the actual endpoint
    cache: new InMemoryCache()
  });

  const GET_TRANSACTION_DETAILS = gql`
  query GetTransactionDetails($hash: String!) {
    transaction(id: $hash) {
      status {
        __typename
      }
    }
  }
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { hash } = req.query;
    
    if (typeof hash !== 'string') {
      res.status(400).json({ error: 'Invalid hash parameter' });
      return;
    }
  
    try {
      const response = await client.query({
        query: GET_TRANSACTION_DETAILS,
        variables: { hash }
      });
  
      const transaction = response.data.transaction;
  
      if (transaction) {
        res.status(200).json(transaction);
      } else {
        res.status(404).json({ error: 'Transaction not found' });
      }
    } catch (error:any) {
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  }