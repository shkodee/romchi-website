import '../globals.css';
export const metadata = { title: 'Romchi', robots: { index: false } };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="uz"><body>{children}</body></html>;
}
