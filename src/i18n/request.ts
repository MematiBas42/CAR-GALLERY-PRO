import {getRequestConfig} from 'next-intl/server';
import {cookies, headers} from 'next/headers';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headersList = await headers();
  const pathname = headersList.get('x-next-intl-pathname') || '';
  
  // Force 'en' for admin routes
  let locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';
  if (pathname.startsWith('/admin')) {
    locale = 'en';
  }

  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`[i18n/request] Failed to load messages for locale: ${locale}`, error);
    messages = (await import(`../../messages/en.json`)).default;
  }

  return {
    locale,
    messages
  };
});
