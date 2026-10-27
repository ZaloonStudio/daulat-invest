/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Legacy relative PSX filing links were crawled on our domain.
      // Preserve the document ID and send visitors to the original publisher.
      { source: '/download/document/:file(\\d+\\.pdf)', destination: 'https://dps.psx.com.pk/download/document/:file', permanent: true },
      { source: '/download/attachment/:file(\\d+-\\d+\\.pdf)', destination: 'https://dps.psx.com.pk/download/attachment/:file', permanent: true },
      // NBP Funds appears in issuer announcements, but is not a listed stock.
      { source: '/stocks/NBP-FUNDS', destination: '/mutual-funds', permanent: true },
    ];
  },
};

export default nextConfig;
