import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'The Stack | Conversation Tracker',
  description: 'Conversation tracking and facilitation',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}