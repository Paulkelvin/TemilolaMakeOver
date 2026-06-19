"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { navLinks } from "@/lib/site-config";
import { Button, WhatsAppButton } from "@/components/ui/Button";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  availabilityUrl: string;
}

export function MobileMenu({
  isOpen,
  onClose,
  availabilityUrl,
}: MobileMenuProps) {
  const bookingUrl = buildWhatsAppUrl({ intent: "booking" });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-40 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="absolute inset-0 bg-luxury-dark/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.nav
            className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-bg-cream shadow-2xl flex flex-col p-6 pt-24"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            aria-label="Mobile navigation"
          >
            <ul className="flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.4 }}
                >
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className="block py-3 text-lg font-display text-text-primary hover:text-accent-rose transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>

            <div className="mt-auto flex flex-col gap-3 pt-8">
              <Button
                href={availabilityUrl}
                external
                variant="primary"
                size="lg"
                className="w-full"
              >
                Check Availability
              </Button>
              <WhatsAppButton href={bookingUrl} size="lg" className="w-full">
                Book on WhatsApp
              </WhatsAppButton>
            </div>
          </motion.nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
