// saves-data.js - Fetches, inserts, and updates save records via the Nhost GraphQL endpoint

const GRAPHQL_ENDPOINT = 'https://riexiuwkfkxlgxuurqeq.hasura.ap-south-1.nhost.run/v1/graphql';
const NETWORK_ERROR_MSG = 'Could not reach the save server. Check your connection and try again.';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SAVE_FIELDS = `
  id
  title
  description
  game_version
  sim_day
  citizens_alive
  summary
  downloads
  created_at
  file_id
`;

async function graphqlRequest(query, variables, options = {}) {
  let response;
  try {
    response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      keepalive: Boolean(options.keepalive),
    });
  } catch {
    throw new Error(NETWORK_ERROR_MSG);
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`Save server returned an unexpected response (${response.status}).`);
  }

  if (!response.ok) {
    const serverMsg = payload?.errors?.[0]?.message || payload?.message || `Server error (${response.status}).`;
    throw new Error(serverMsg);
  }

  if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
    throw new Error(payload.errors[0].message || 'The save server could not complete that request.');
  }

  return payload?.data || {};
}

export async function getSaves() {
  const query = `query { saves(order_by: {created_at: desc}) { ${SAVE_FIELDS} } }`;
  const data = await graphqlRequest(query);
  return Array.isArray(data.saves) ? data.saves : [];
}

export async function getSaveById(id) {
  const cleanId = typeof id === 'string' ? id.trim() : '';
  if (!UUID_PATTERN.test(cleanId)) {
    return null;
  }
  const query = `query GetSaveById($id: uuid!) { saves_by_pk(id: $id) { ${SAVE_FIELDS} } }`;
  const data = await graphqlRequest(query, { id: cleanId });
  return data.saves_by_pk || null;
}

export async function insertSave(saveObject) {
  const mutation = `
    mutation InsertSave($object: saves_insert_input!) {
      insert_saves_one(object: $object) {
        id
      }
    }
  `;
  const data = await graphqlRequest(mutation, { object: saveObject });
  if (!data.insert_saves_one?.id) {
    throw new Error('The save record could not be created.');
  }
  return data.insert_saves_one;
}

export async function incrementDownloads(id) {
  const cleanId = typeof id === 'string' ? id.trim() : '';
  if (!UUID_PATTERN.test(cleanId)) {
    return null;
  }
  const mutation = `
    mutation IncrementDownloads($id: uuid!) {
      update_saves_by_pk(pk_columns: { id: $id }, _inc: { downloads: 1 }) {
        id
        downloads
      }
    }
  `;
  const data = await graphqlRequest(mutation, { id: cleanId }, { keepalive: true });
  return data.update_saves_by_pk || null;
}
