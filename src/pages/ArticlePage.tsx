import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Clock } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { articleReadingMinutes, type Article } from '@/lib/articles';
import { canonicalUrl, seoForArticle, structuredDataForPage } from '@/lib/seo';
import './articles.css';
import './article-improvements.css';

function setMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) { element = document.createElement('meta'); document.head.appendChild(element); }
  Object.entries(attributes).forEach(([key, value]) => element!.setAttribute(key, value));
}

export default function ArticlePage() {
  const { slug = '' } = useParams();
  const [hasStaticFallback] = useState(() => Boolean(document.getElementById('seo-static-content')));
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(''); setArticle(null); setRelated([]);
    fetch(`/api/articles/${encodeURIComponent(slug)}`, { signal: controller.signal })
      .then(async response => {
        const body = await response.text();
        let data: { article?: Article; related?: Article[]; error?: string } = {};
        try { data = body ? JSON.parse(body) : {}; }
        catch { throw new Error('The article service returned an unreadable response.'); }
        if (!response.ok) throw new Error(data.error || 'Unable to load this article.');
        if (!data.article) throw new Error('The article service returned an incomplete response.');
        setArticle(data.article);
        setRelated(data.related || []);
      })
      .catch(fetchError => { if (fetchError.name !== 'AbortError') setError(fetchError.message); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [slug]);

  useEffect(() => {
    if (!article) return;
    document.getElementById('seo-static-content')?.remove();
    const page = seoForArticle(article);
    const canonical = canonicalUrl(page);
    document.title = page.title;
    setMeta('meta[name="description"]', { name: 'description', content: page.description });
    setMeta('meta[name="robots"]', { name: 'robots', content: 'index, follow, max-image-preview:large' });
    setMeta('meta[property="og:title"]', { property: 'og:title', content: page.title });
    setMeta('meta[property="og:description"]', { property: 'og:description', content: page.description });
    setMeta('meta[property="og:url"]', { property: 'og:url', content: canonical });
    if (page.imageUrl) setMeta('meta[property="og:image"]', { property: 'og:image', content: page.imageUrl });
    const canonicalLink = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonicalLink) canonicalLink.href = canonical;
    document.getElementById('seo-structured-data')?.remove();
    const script = document.createElement('script');
    script.id = 'seo-structured-data'; script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredDataForPage(page));
    document.head.appendChild(script);
  }, [article]);

  const date = article?.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const updatedDate = article?.updatedAt ? new Date(article.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const wasRevised = Boolean(article?.publishedAt && article.updatedAt.slice(0, 10) !== article.publishedAt.slice(0, 10));

  // On a direct article request, the server has already supplied the complete
  // article. Leave that version visible until the interactive copy is ready.
  if (hasStaticFallback && !article) return null;

  return <div className="min-h-screen bg-background flex flex-col">
    <Header />
    <main className="site-main flex-grow">
      {loading ? <p className="article-state" role="status">Loading article…</p> : error || !article ? <div className="article-empty container mx-auto px-4"><h1>Article not found</h1><p>{error || 'This article is not available.'}</p><Button asChild><Link to="/articles"><ArrowLeft />View all articles</Link></Button></div> : <article className="article-detail">
        <div className="article-detail-header">
          <Link className="article-back" to="/articles"><ArrowLeft />All articles</Link>
          <Badge variant="outline">{article.category}</Badge>
          <h1>{article.title}</h1>
          <p className="article-detail-excerpt">{article.excerpt}</p>
          <div className="article-meta"><span>By {article.authorName}</span><span>Published {date}</span>{wasRevised && <span>Updated {updatedDate}</span>}<span><Clock />{articleReadingMinutes(article.content)} min read</span></div>
        </div>
        {article.imageUrl && <img className="article-hero-image" src={article.imageUrl} alt={article.imageAlt} />}
        <div className="article-prose"><ReactMarkdown components={{ a: props => <a {...props} rel="noopener noreferrer" /> }}>{article.content}</ReactMarkdown></div>
        <p className="article-editorial-note">Our guides explain general property research and are not legal, financial or surveying advice. See <Link to="/data-sources">how UKHomePack sources and presents property data</Link>.</p>
        {article.tags.length > 0 && <div className="article-tags" aria-label="Article topics">{article.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}</div>}
        {related.length > 0 && <aside className="article-related"><h2>Related property guides</h2><div className="article-related-grid">{related.map(item => <article key={item.id}><Badge variant="outline">{item.category}</Badge><h3><Link to={`/articles/${item.slug}`}>{item.title}</Link></h3><p>{item.excerpt}</p></article>)}</div></aside>}
        <aside className="article-cta"><h2>Researching a property?</h2><p>Bring available property and local-area records together in one UKHomePack report.</p><Button asChild><Link to="/tool">Create a property report</Link></Button></aside>
      </article>}
    </main>
    <Footer />
  </div>;
}
