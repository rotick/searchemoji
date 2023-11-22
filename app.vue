<template>
  <NuxtPage />
</template>
<script setup lang="ts">
useHead({
  // meta: [
  //   {
  //     name: 'description',
  //     content: t('seo.description')
  //   },
  //   { name: 'keywords', content: t('seo.keywords') },
  //   { property: 'og:site_name', content: 'Yesicon' },
  //   { property: 'og:url', content: `${origin}/` },
  //   { property: 'og:type', content: 'website' },
  //   { property: 'og:title', content: t('seo.title') },
  //   { property: 'og:description', content: t('seo.description') },
  //   { property: 'og:image', content: `${origin}/card.png` },
  //   { name: 'twitter:card', content: 'summary_large_image' },
  //   { name: 'twitter:domain', content: url.host },
  //   { name: 'twitter:url', content: `${origin}/` },
  //   { name: 'twitter:title', content: t('seo.title') },
  //   { name: 'twitter:description', content: t('seo.description') },
  //   { name: 'twitter:image', content: `${origin}/card.png` },
  //   { name: 'msapplication-TileColor', content: '#da532c' }
  // ],
  link: [
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      href: '/favicon-16x16.png'
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      href: '/favicon-32x32.png'
    },
    {
      rel: 'apple-touch-icon',
      sizes: '152x152',
      href: '/apple-touch-icon.png'
    },
    {
      rel: 'manifest',
      href: '/site.webmanifest'
    }
  ]
})
</script>
