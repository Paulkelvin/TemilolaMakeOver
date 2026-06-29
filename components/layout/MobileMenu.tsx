"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { navLinks } from "@/lib/site-config";
import { Button, WhatsAppButton } from "@/components/ui/Button";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { services } from "@/data/services";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckAvailability: () => void;
}

export function MobileMenu({
  isOpen,
  onClose,
  onCheckAvailability,
}: MobileMenuProps) {
  const bookingUrl = buildWhatsAppUrl({ intent: "booking" });
  const [servicesOpen, setServicesOpen] = useState(false);

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
            className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-bg-cream shadow-2xl flex flex-col p-6 pt-24 overflow-y-auto"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            aria-label="Mobile navigation"
          >
            <ul className="flex flex-col gap-1">
              {navLinks.map((link, i) => {
                if (link.label === "Services") {
                  return (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i, duration: 0.4 }}
                    >
                      <button
                        type="button"
                        onClick={() => setServicesOpen((o) => !o)}
                        className="w-full flex items-center justify-between py-3 text-lg font-display text-text-primary hover:text-accent-rose transition-colors"
                      >
                        Services
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 text-text-muted transition-transform duration-300",
                            servicesOpen && "rotate-180"
                          )}
                        />
                      </button>
                      <AnimatePresence>
                        {servicesOpen && (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden pl-3 border-l-2 border-accent-rose/20 mb-2"
                          >
                            {services.map((s) => (
                              <li key={s.slug}>
                                <Link
                                  href={`/services/${s.slug}`}
                                  onClick={onClose}
                                  className="block py-2 text-sm text-text-muted hover:text-accent-rose transition-colors"
                                >
                                  {s.name}
                                </Link>
                              </li>
                            ))}
                            <li>
                              <Link
                                href="/services"
                                onClick={onClose}
                                className="block py-2 text-sm font-medium text-accent-rose hover:underline"
                              >
                                View All Services →
                              </Link>
                            </li>
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </motion.li>
                  );
                }

                return (
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
                );
              })}
            </ul>

            <div className="mt-auto flex flex-col gap-3 pt-8">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={onCheckAvailability}
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
