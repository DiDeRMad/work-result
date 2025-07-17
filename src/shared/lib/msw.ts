export async function initMockServiceWorker() {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV === 'development') {
    const { worker } = await import('@/mock/browser');
    worker.start();
  }
} 