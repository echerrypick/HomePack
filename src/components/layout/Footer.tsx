import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, MessageCircle } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Product',
      links: [
        { name: 'Property Report Features', href: '/features' },
        { name: 'Property Report Pricing', href: '/pricing' },
        { name: 'Sample Property Report', href: '/sample' },
        { name: 'Create a Property Report', href: '/tool' },
      ],
    },
    {
      title: 'Guides',
      links: [
        { name: 'Checks Before Buying', href: '/buyer-guide' },
        { name: 'Selling Property Guide', href: '/seller-guide' },
        { name: 'Council Tax Band Checker', href: '/council-tax' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'Contact', href: '/contact' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Privacy Policy', href: '/privacy' },
      ],
    },
  ];

  return (
    <footer className="site-footer bg-card border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-1.5 bg-primary rounded-lg group-hover:scale-105 transition-transform">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">UKHomePack.com</span>
            </Link>
            <p className="text-muted-foreground max-w-sm leading-relaxed">
              Online UK property reports using available public and official records to help buyers, sellers and property professionals make informed decisions.
            </p>
          </div>

          {/* Links Columns */}
          {footerLinks.map((section) => (
            <div key={section.title} className="space-y-6">
              <h4 className="text-sm font-bold uppercase tracking-wider text-foreground/80">
                {section.title}
              </h4>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href} 
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-muted-foreground">
            © {currentYear} UKHomePack.com. All rights reserved.
          </p>
          <div className="flex items-center gap-8">
             <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MessageCircle className="h-3 w-3" />
                <Link to="/contact" className="hover:underline">Contact UKHomePack</Link>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
