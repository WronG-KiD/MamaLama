import type { Metadata } from 'next';
import { Fredoka, Bubblegum_Sans } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Sparkles, BalloonMascot, WelcomeBubble } from '@/components/Decorations';
import { StoreProvider } from '@/lib/StoreContext';
import { UIProvider } from '@/lib/UIContext';
import ProductStoryModal from '@/components/ProductStoryModal';
import CartToast from '@/components/CartToast';
import ParallaxEffects from '@/components/ParallaxEffects';
import RazorpayScript from '@/components/RazorpayScript';

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-fredoka',
  display: 'swap'
});

const bubblegum = Bubblegum_Sans({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bubblegum',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'MamaLama — Puzzles, Toys & Books for Curious Kids',
  description:
    'Mama-made, kid-approved. Puzzles, toys and books designed to grow with your child. Welcome to MamaLama.',
  icons: { icon: '/favicon.ico' }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fredoka.variable} ${bubblegum.variable}`}>
      <body>
        <StoreProvider>
          <UIProvider>
            <Sparkles />
            <BalloonMascot />
            <WelcomeBubble />
            <Header />
            <main>{children}</main>
            <Footer />
            <ProductStoryModal />
            <CartToast />
            <ParallaxEffects />
            <RazorpayScript />
          </UIProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
