/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // यह बिल्ड के समय ESLint एरर्स (जैसे unescaped entities) को इग्नोर करेगा
    ignoreDuringBuilds: true,
  },
  // अगर आपके पास पहले से कोई इमेज डोमेन या अन्य कॉन्फ़िगरेशन था, तो उसे यहाँ रख सकते हैं
};

module.exports = nextConfig;