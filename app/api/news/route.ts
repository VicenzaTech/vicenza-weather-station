import { NextResponse } from 'next/server'
import Parser from 'rss-parser'

export const dynamic = 'force-dynamic'

const parser = new Parser({
  customFields: {
    item: [
      ['description', 'snippet'],
    ]
  }
})

const RSS_URL = 'https://truyenhinhthanhhoa.vn/rss/tin-tuc.rss'

interface NewsItem {
  title: string
  link: string
  pubDate: string
  snippet: string
}

export async function GET() {
  try {
    const feed = await parser.parseURL(RSS_URL)

    const news: NewsItem[] = feed.items.slice(0, 10).map(item => ({
      title: item.title || 'Không có tiêu đề',
      link: item.link || '#',
      pubDate: item.pubDate || '',
      snippet: item.snippet || item.contentSnippet || ''
    }))

    return NextResponse.json({ news })
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news', news: [] },
      { status: 500 }
    )
  }
}
