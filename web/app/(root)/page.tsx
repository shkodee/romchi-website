// "/" → язык по браузеру (ru → /ru/, иначе /uz/). На своём сервере лучше сделать 302 в nginx.
export default function Index() {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var l=(navigator.language||'').toLowerCase().indexOf('ru')===0?'ru':'uz';location.replace('/'+l+'/'+location.search+location.hash)})()`,
        }}
      />
      <noscript><meta httpEquiv="refresh" content="0; url=/uz/" /></noscript>
      <p style={{ fontFamily: 'sans-serif', padding: 24 }}><a href="/uz/">Oʻzbekcha</a> · <a href="/ru/">Русский</a></p>
    </>
  );
}
