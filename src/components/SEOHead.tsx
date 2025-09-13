import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  structuredData?: object;
}

export function SEOHead({
  title = "SoftwareStack Evaluator - Monitor & Analyze Your Software Performance",
  description = "Comprehensive software monitoring platform with real-time performance tracking, uptime monitoring, and automated analysis. Optimize your software stack with data-driven insights.",
  keywords = "software monitoring, performance tracking, uptime monitoring, software analysis, DevOps tools, application monitoring",
  canonical,
  ogImage = "https://lovable.dev/opengraph-image-p98pqg.png",
  ogType = "website",
  structuredData
}: SEOProps) {
  const location = useLocation();
  const baseUrl = window.location.origin;
  const fullUrl = `${baseUrl}${location.pathname}`;
  const canonicalUrl = canonical || fullUrl;

  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "SoftwareStack Evaluator",
    "applicationCategory": "BusinessApplication",
    "description": description,
    "url": baseUrl,
    "offers": {
      "@type": "Offer",
      "category": "SaaS"
    },
    "provider": {
      "@type": "Organization",
      "name": "SoftwareStack Evaluator"
    }
  };

  const finalStructuredData = structuredData || defaultStructuredData;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="SoftwareStack Evaluator" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Additional SEO */}
      <meta name="robots" content="index,follow" />
      <meta name="author" content="SoftwareStack Evaluator" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(finalStructuredData)}
      </script>
    </Helmet>
  );
}