import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { BookOpen, Eye, FilePenLine, Plus, Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ARTICLE_CATEGORIES, articleSlug, type Article, type ArticleInput, type ArticleStatus } from '@/lib/articles';
import { billingRequest } from '@/lib/billing-client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import '@/pages/articles.css';

const EMPTY: ArticleInput = {
  slug: '', title: '', excerpt: '', content: '', category: ARTICLE_CATEGORIES[0], tags: [],
  imageUrl: '', imageAlt: '', authorName: 'UKHomePack Editorial Team', seoTitle: '', seoDescription: '',
  status: 'draft', featured: false,
};

export function ArticleManager() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [form, setForm] = useState<ArticleInput>(EMPTY);
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const result = await billingRequest('/api/admin/articles');
      setArticles(result.articles || []);
    } catch (error: any) {
      toast.error(error.message || 'Unable to load articles');
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const begin = (article?: Article) => {
    setEditing(article || null);
    setForm(article ? {
      slug: article.slug, title: article.title, excerpt: article.excerpt, content: article.content,
      category: article.category, tags: article.tags, imageUrl: article.imageUrl, imageAlt: article.imageAlt,
      authorName: article.authorName, seoTitle: article.seoTitle, seoDescription: article.seoDescription,
      status: article.status, featured: article.featured,
    } : { ...EMPTY });
    setSlugTouched(Boolean(article)); setPreview(false); setOpen(true);
  };

  const update = <K extends keyof ArticleInput>(key: K, value: ArticleInput[K]) => setForm(current => ({ ...current, [key]: value }));

  const updateTitle = (title: string) => setForm(current => ({ ...current, title, ...(!slugTouched ? { slug: articleSlug(title) } : {}) }));

  const format = (before: string, after = before, placeholder = 'text') => {
    const area = contentRef.current;
    if (!area) return;
    const start = area.selectionStart; const end = area.selectionEnd;
    const selection = form.content.slice(start, end) || placeholder;
    const content = `${form.content.slice(0, start)}${before}${selection}${after}${form.content.slice(end)}`;
    update('content', content);
    requestAnimationFrame(() => { area.focus(); area.setSelectionRange(start + before.length, start + before.length + selection.length); });
  };

  const save = async (status: ArticleStatus) => {
    setSaving(true);
    try {
      const payload = { ...form, status, tags: form.tags };
      await billingRequest(editing ? `/api/admin/articles/${editing.id}` : '/api/admin/articles', payload, editing ? 'PATCH' : 'POST');
      toast.success(status === 'published' ? 'Article published' : 'Draft saved');
      setOpen(false); await load();
    } catch (error: any) {
      toast.error(error.message || 'Unable to save the article');
    } finally { setSaving(false); }
  };

  const changeStatus = async (article: Article, status: ArticleStatus) => {
    setSaving(true);
    try {
      await billingRequest(`/api/admin/articles/${article.id}`, { ...article, status }, 'PATCH');
      toast.success(status === 'published' ? 'Article published' : 'Article returned to draft');
      await load();
    } catch (error: any) { toast.error(error.message || 'Unable to update the article'); }
    finally { setSaving(false); }
  };

  const remove = async (article: Article) => {
    if (!window.confirm(`Delete draft “${article.title}”? This cannot be undone.`)) return;
    try {
      await billingRequest(`/api/admin/articles/${article.id}`, undefined, 'DELETE');
      toast.success('Draft deleted'); await load();
    } catch (error: any) { toast.error(error.message || 'Unable to delete the article'); }
  };

  return <>
    <Card className="mb-8">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" />Articles</CardTitle><p className="mt-1 text-sm text-muted-foreground">Write articles privately as drafts, preview them and publish when ready.</p></div>
          <Button onClick={() => begin()}><Plus />New article</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="rounded-xl border bg-muted/20 p-4"><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold">{articles.length}</p></div>
          <div className="rounded-xl border bg-muted/20 p-4"><p className="text-sm text-muted-foreground">Drafts</p><p className="text-2xl font-bold">{articles.filter(article => article.status === 'draft').length}</p></div>
          <div className="rounded-xl border bg-muted/20 p-4"><p className="text-sm text-muted-foreground">Live</p><p className="text-2xl font-bold">{articles.filter(article => article.status === 'published').length}</p></div>
        </div>
        {loading ? <p className="py-8 text-center text-muted-foreground">Loading articles…</p> : articles.length === 0 ? <div className="rounded-xl border border-dashed p-10 text-center"><BookOpen className="mx-auto mb-3 h-9 w-9 text-primary" /><h3 className="font-semibold">No articles yet</h3><p className="mt-1 text-sm text-muted-foreground">Create your first article and save it as a draft.</p></div> : <div className="space-y-3">{articles.map(article => <div key={article.id} className="flex flex-col gap-4 rounded-xl border p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{article.title}</h3><Badge variant={article.status === 'published' ? 'default' : 'secondary'}>{article.status === 'published' ? 'Live' : 'Draft'}</Badge>{article.featured && <Badge variant="outline">Featured</Badge>}</div><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{article.excerpt}</p><p className="mt-2 text-xs text-muted-foreground">/{article.slug} · Updated {new Date(article.updatedAt).toLocaleString('en-GB')}</p></div>
          <div className="flex shrink-0 flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => begin(article)}><FilePenLine />Edit</Button>{article.status === 'published' ? <><Button asChild size="sm" variant="outline"><a href={`/articles/${article.slug}`} target="_blank" rel="noreferrer"><Eye />View</a></Button><Button size="sm" variant="outline" disabled={saving} onClick={() => changeStatus(article, 'draft')}>Unpublish</Button></> : <><Button size="sm" disabled={saving} onClick={() => changeStatus(article, 'published')}><Send />Publish</Button><Button size="icon-sm" variant="outline" className="text-destructive" aria-label={`Delete ${article.title}`} onClick={() => remove(article)}><Trash2 /></Button></>}</div>
        </div>)}</div>}
      </CardContent>
    </Card>

    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editing ? 'Edit article' : 'Create new article'}</DialogTitle></DialogHeader>
        <div className="flex gap-2 border-b pb-3"><Button type="button" variant={!preview ? 'default' : 'ghost'} onClick={() => setPreview(false)}><FilePenLine />Edit</Button><Button type="button" variant={preview ? 'default' : 'ghost'} onClick={() => setPreview(true)}><Eye />Preview</Button></div>
        {preview ? <div className="rounded-xl border p-6 md:p-10"><Badge variant="outline">{form.category}</Badge><h1 className="mt-4 text-4xl font-bold tracking-tight">{form.title || 'Untitled article'}</h1><p className="mt-4 text-lg text-muted-foreground">{form.excerpt}</p>{form.imageUrl && <img className="my-6 aspect-video w-full rounded-xl object-cover" src={form.imageUrl} alt={form.imageAlt} />}<div className="article-prose"><ReactMarkdown>{form.content || 'Start writing to preview the article.'}</ReactMarkdown></div></div> : <div className="grid gap-5 py-2">
          <label className="grid gap-1.5 text-sm font-medium">Title<Input value={form.title} maxLength={140} onChange={event => updateTitle(event.target.value)} /></label>
          <div className="grid gap-5 md:grid-cols-2"><label className="grid gap-1.5 text-sm font-medium">URL slug<Input value={form.slug} maxLength={80} disabled={Boolean(editing?.publishedAt)} onChange={event => { setSlugTouched(true); update('slug', articleSlug(event.target.value)); }} /><span className="font-normal text-muted-foreground">{editing?.publishedAt ? 'Locked because this URL has been published.' : `ukhomepack.com/articles/${form.slug || 'article-url'}`}</span></label><label className="grid gap-1.5 text-sm font-medium">Category<Select value={form.category} onValueChange={value => update('category', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ARTICLE_CATEGORIES.map(item => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></label></div>
          <label className="grid gap-1.5 text-sm font-medium">Excerpt<Textarea value={form.excerpt} maxLength={320} rows={3} onChange={event => update('excerpt', event.target.value)} /><span className="font-normal text-muted-foreground">Used on the articles page and in search descriptions. {form.excerpt.length}/320</span></label>
          <label className="grid gap-1.5 text-sm font-medium">Full content <span className="font-normal text-muted-foreground">Markdown formatting supported</span><div className="flex flex-wrap gap-2"><Button type="button" size="sm" variant="outline" onClick={() => format('**')}>Bold</Button><Button type="button" size="sm" variant="outline" onClick={() => format('*')}>Italic</Button><Button type="button" size="sm" variant="outline" onClick={() => format('## ', '', 'Heading')}>Heading</Button><Button type="button" size="sm" variant="outline" onClick={() => format('[', '](https://)', 'link text')}>Link</Button><Button type="button" size="sm" variant="outline" onClick={() => format('- ', '', 'List item')}>List</Button></div><Textarea ref={contentRef} value={form.content} rows={16} maxLength={50000} onChange={event => update('content', event.target.value)} /></label>
          <div className="grid gap-5 md:grid-cols-2"><label className="grid gap-1.5 text-sm font-medium">Image URL <span className="font-normal text-muted-foreground">optional, HTTPS only</span><Input type="url" value={form.imageUrl} onChange={event => update('imageUrl', event.target.value)} placeholder="https://…" /></label><label className="grid gap-1.5 text-sm font-medium">Image description <span className="font-normal text-muted-foreground">required when using an image</span><Input value={form.imageAlt} maxLength={180} onChange={event => update('imageAlt', event.target.value)} placeholder="Describe the image for accessibility" /></label></div>
          <div className="grid gap-5 md:grid-cols-2"><label className="grid gap-1.5 text-sm font-medium">Author name<Input value={form.authorName} maxLength={80} onChange={event => update('authorName', event.target.value)} /></label><label className="grid gap-1.5 text-sm font-medium">Tags <span className="font-normal text-muted-foreground">comma separated</span><Input value={form.tags.join(', ')} onChange={event => update('tags', event.target.value.split(',').map(tag => tag.trim()).filter(Boolean))} placeholder="homebuyer, planning, due diligence" /></label></div>
          <div className="grid gap-5 md:grid-cols-2"><label className="grid gap-1.5 text-sm font-medium">SEO title <span className="font-normal text-muted-foreground">optional</span><Input value={form.seoTitle} maxLength={70} onChange={event => update('seoTitle', event.target.value)} placeholder={form.title || 'Search result title'} /></label><label className="grid gap-1.5 text-sm font-medium">SEO description <span className="font-normal text-muted-foreground">optional</span><Textarea value={form.seoDescription} maxLength={170} rows={2} onChange={event => update('seoDescription', event.target.value)} placeholder={form.excerpt || 'Search result description'} /></label></div>
          <div className="rounded-xl border bg-muted/20 p-5"><h3 className="font-semibold">Publishing checklist</h3><p className="mt-1 text-sm text-muted-foreground">Use this as an editorial check before making the article live. It is guidance, not an automatic accuracy review.</p><ul className="mt-4 grid gap-2 text-sm md:grid-cols-2">{articleChecks(form).map(item => <li key={item.label} className="flex items-start gap-2"><span className={item.done ? 'text-emerald-600' : 'text-muted-foreground'}>{item.done ? '✓' : '○'}</span><span>{item.label}</span></li>)}</ul></div>
          <label className="flex items-center justify-between gap-4 rounded-xl border p-4"><span><strong className="block">Featured article</strong><span className="text-sm text-muted-foreground">Show this prominently on the articles page.</span></span><input type="checkbox" className="h-5 w-5" checked={form.featured} onChange={event => update('featured', event.target.checked)} /></label>
        </div>}
        <div className="flex flex-wrap justify-end gap-3 border-t pt-4"><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button type="button" variant="outline" disabled={saving} onClick={() => save('draft')}>{saving ? 'Saving…' : 'Save draft'}</Button><Button type="button" disabled={saving} onClick={() => save('published')}><Send />{saving ? 'Saving…' : editing?.status === 'published' ? 'Save published article' : 'Publish article'}</Button></div>
      </DialogContent>
    </Dialog>
  </>;
}

function articleChecks(form: ArticleInput) {
  return [
    { label: 'Clear, search-focused title', done: form.title.trim().length >= 20 },
    { label: 'Useful excerpt for listing and search', done: form.excerpt.trim().length >= 80 },
    { label: 'At least two descriptive headings', done: (form.content.match(/^##+\s+/gm) || []).length >= 2 },
    { label: 'Links to supporting or official sources', done: /\[[^\]]+\]\(https:\/\//.test(form.content) },
    { label: 'Internal link to a relevant UKHomePack page', done: /\[[^\]]+\]\(\//.test(form.content) || /ukhomepack\.com\//i.test(form.content) },
    { label: 'Practical next step or call to action', done: /(next step|create a report|check a property|contact|sample report)/i.test(form.content) },
    { label: 'Image has a meaningful description', done: !form.imageUrl || form.imageAlt.trim().length >= 12 },
    { label: 'SEO title and description reviewed', done: form.seoTitle.trim().length >= 20 && form.seoDescription.trim().length >= 80 },
  ];
}
