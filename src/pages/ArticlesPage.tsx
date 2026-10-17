import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageHero } from '@/components/layout/PageHero';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { articleReadingMinutes, type Article } from '@/lib/articles';
import './articles.css';

function publishedDate(article: Article) {
  return new Date(article.publishedAt || article.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/articles', { signal: controller.signal })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to load articles.');
        setArticles(data.articles || []);
      })
      .catch(fetchError => { if (fetchError.name !== 'AbortError') setError(fetchError.message); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const categories = useMemo(() => ['All', ...new Set(articles.map(article => article.category))], [articles]);
  const visible = category === 'All' ? articles : articles.filter(article => article.category === category);
  const featured = visible.find(article => article.featured) || visible[0];
  const remaining = featured ? visible.filter(article => article.id !== featured.id) : [];

  return <div className="min-h-screen bg-background flex flex-col">
    <Header />
    <main className="site-main flex-grow">
      <div className="container mx-auto px-4">
        <PageHero eyebrow="UK property knowledge" illustration="simple" icon={<BookOpen />}>
          <h1 className="site-page-heading">Property articles and practical home-moving guides</h1>
          <p>Clear, useful information about researching, buying and selling UK property.</p>
        </PageHero>
      </div>

      <section className="articles-section container mx-auto px-4 pb-20">
        {categories.length > 1 && <div className="article-filters" aria-label="Filter articles by category">
          {categories.map(item => <Button key={item} type="button" size="sm" variant={category === item ? 'default' : 'outline'} onClick={() => setCategory(item)}>{item}</Button>)}
        </div>}

        {loading ? <p className="article-state" role="status">Loading articles…</p> : error ? <p className="article-state text-destructive">{error}</p> : !featured ? <div className="article-empty"><BookOpen /><h2>Articles are coming soon</h2><p>We are preparing practical guides about UK property research.</p></div> : <>
          <article className="article-featured">
            {featured.imageUrl && <Link to={`/articles/${featured.slug}`} className="article-featured-image"><img src={featured.imageUrl} alt={featured.imageAlt} /></Link>}
            <div className="article-featured-copy">
              <Badge variant="outline">{featured.category}</Badge>
              <h2><Link to={`/articles/${featured.slug}`}>{featured.title}</Link></h2>
              <p>{featured.excerpt}</p>
              <div className="article-meta"><span>{publishedDate(featured)}</span><span><Clock />{featured.readingMinutes || articleReadingMinutes(featured.content || '')} min read</span></div>
              <Link className="article-read-link" to={`/articles/${featured.slug}`}>Read article <ArrowRight /></Link>
            </div>
          </article>

          {remaining.length > 0 && <div className="article-grid">{remaining.map(article => <article className="article-card" key={article.id}>
            {article.imageUrl && <Link to={`/articles/${article.slug}`} className="article-card-image"><img src={article.imageUrl} alt={article.imageAlt} loading="lazy" /></Link>}
            <div className="article-card-copy">
              <Badge variant="outline">{article.category}</Badge>
              <h2><Link to={`/articles/${article.slug}`}>{article.title}</Link></h2>
              <p>{article.excerpt}</p>
              <div className="article-meta"><span>{publishedDate(article)}</span><span><Clock />{article.readingMinutes || articleReadingMinutes(article.content || '')} min read</span></div>
              <Link className="article-read-link" to={`/articles/${article.slug}`}>Read article <ArrowRight /></Link>
            </div>
          </article>)}</div>}
        </>}
      </section>
    </main>
    <Footer />
  </div>;
}
