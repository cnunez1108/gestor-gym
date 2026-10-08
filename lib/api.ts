export async function api<T>(path: string, method='GET', data?: unknown): Promise<T> {
  const response=await fetch(`/api/${path}`,{method,headers:{'Content-Type':'application/json'},body:data === undefined ? undefined : JSON.stringify(data),cache:'no-store'});
  const result=await response.json();
  if (!response.ok) {
    if (response.status===401 && !path.startsWith('auth/')) {
      // A full navigation discards data from an expired session.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign('/login');
    }
    throw new Error(result.error || 'No se pudo completar la operación.');
  }
  return result;
}
