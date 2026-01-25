import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { apiSuccess, apiError } from "@/lib/api-response";

// Vercel cron jobs use this secret to authenticate
const CRON_SECRET = process.env.CRON_SECRET;

interface NewsItem {
  title: string;
  url: string;
  source: string;
  description?: string;
}

/**
 * Fetch top stories from Hacker News
 */
async function fetchHackerNewsStories(limit = 5): Promise<NewsItem[]> {
  try {
    const topStoriesRes = await fetch(
      "https://hacker-news.firebaseio.com/v0/topstories.json"
    );
    const topStoryIds: number[] = await topStoriesRes.json();

    const stories = await Promise.all(
      topStoryIds.slice(0, limit).map(async (id) => {
        const storyRes = await fetch(
          `https://hacker-news.firebaseio.com/v0/item/${id}.json`
        );
        const story = await storyRes.json();
        return {
          title: story.title,
          url: story.url || `https://news.ycombinator.com/item?id=${id}`,
          source: "Hacker News",
          description: story.text?.slice(0, 150) || undefined,
        };
      })
    );

    return stories.filter((s) => s.title && s.url);
  } catch (error) {
    console.error("Error fetching Hacker News:", error);
    return [];
  }
}

/**
 * Fetch trending articles from Dev.to
 */
async function fetchDevToArticles(limit = 5): Promise<NewsItem[]> {
  try {
    const res = await fetch(
      `https://dev.to/api/articles?per_page=${limit}&top=7`
    );
    const articles = await res.json();

    return articles.map((article: any) => ({
      title: article.title,
      url: article.url,
      source: "Dev.to",
      description: article.description?.slice(0, 150),
    }));
  } catch (error) {
    console.error("Error fetching Dev.to:", error);
    return [];
  }
}

/**
 * Fetch tech news from NewsAPI (if API key is configured)
 */
async function fetchNewsAPIArticles(limit = 5): Promise<NewsItem[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch(
      `https://newsapi.org/v2/top-headlines?category=technology&language=en&pageSize=${limit}&apiKey=${apiKey}`
    );
    const data = await res.json();

    if (data.status !== "ok") return [];

    return data.articles.map((article: any) => ({
      title: article.title,
      url: article.url,
      source: article.source?.name || "News",
      description: article.description?.slice(0, 150),
    }));
  } catch (error) {
    console.error("Error fetching NewsAPI:", error);
    return [];
  }
}

/**
 * Generate the weekly newsletter HTML
 */
function generateWeeklyNewsletterEmail(
  hackerNews: NewsItem[],
  devTo: NewsItem[],
  techNews: NewsItem[]
): string {
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const renderSection = (title: string, items: NewsItem[], emoji: string) => {
    if (items.length === 0) return "";

    return `
      <div style="margin-bottom: 30px;">
        <h2 style="color: #00ff41; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #00ff41; padding-bottom: 8px;">
          ${emoji} ${title}
        </h2>
        ${items
          .map(
            (item) => `
          <div style="margin-bottom: 15px; padding: 12px; background: #1a1a1a; border-radius: 8px; border-left: 3px solid #00ff41;">
            <a href="${item.url}" style="color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px;">
              ${item.title}
            </a>
            ${item.description ? `<p style="color: #999; font-size: 13px; margin: 8px 0 0 0;">${item.description}</p>` : ""}
            <p style="color: #666; font-size: 11px; margin: 5px 0 0 0;">via ${item.source}</p>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  };

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #ffffff; background: #000000; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #000 0%, #1a1a1a 100%); padding: 30px 20px; border-radius: 12px 12px 0 0; text-align: center; border-bottom: 3px solid #00ff41;">
        <h1 style="color: #00ff41; margin: 0 0 10px 0; font-size: 28px;">☕ Good Morning!</h1>
        <p style="color: #999; margin: 0; font-size: 14px;">${dateStr}</p>
        <p style="color: #ccc; margin: 10px 0 0 0; font-size: 16px;">Your Weekly Tech Digest</p>
      </div>
      
      <!-- Content -->
      <div style="background: #111; padding: 30px 20px; border-radius: 0 0 12px 12px;">
        
        <p style="color: #ccc; font-size: 15px; margin-bottom: 25px;">
          Here's what's trending in tech this week. Grab your coffee and dive in! ☕
        </p>

        ${renderSection("Hacker News Top Stories", hackerNews, "🔥")}
        ${renderSection("Dev.to Trending", devTo, "💻")}
        ${renderSection("Tech Headlines", techNews, "📰")}

        <!-- CTA -->
        <div style="text-align: center; margin: 30px 0; padding: 20px; background: #1a1a1a; border-radius: 8px;">
          <p style="color: #ccc; margin: 0 0 15px 0;">Need help with your next project?</p>
          <a href="${process.env.NEXTAUTH_URL || "https://dev-dominick.com"}/bookings" 
             style="display: inline-block; background: #00ff41; color: #000; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
            Book a Consultation
          </a>
        </div>
        
        <!-- Footer -->
        <div style="border-top: 1px solid #333; padding-top: 20px; margin-top: 20px; text-align: center;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            You're receiving this because you subscribed to Dominick's newsletter.
          </p>
          <p style="color: #666; font-size: 12px; margin: 10px 0 0 0;">
            <a href="${process.env.NEXTAUTH_URL || "https://dev-dominick.com"}/unsubscribe?email={{EMAIL}}" 
               style="color: #00ff41;">Unsubscribe</a>
            &nbsp;|&nbsp;
            <a href="${process.env.NEXTAUTH_URL || "https://dev-dominick.com"}" 
               style="color: #00ff41;">Visit Website</a>
          </p>
          <p style="color: #444; font-size: 11px; margin: 15px 0 0 0;">
            © ${today.getFullYear()} Dominick's Portfolio. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </body>
</html>
  `;
}

/**
 * POST /api/cron/weekly-newsletter
 * Called by Vercel Cron every Monday at 9am
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (Vercel sends this automatically)
    const authHeader = request.headers.get("authorization");
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      console.warn("Unauthorized cron request");
      return apiError("Unauthorized", 401);
    }

    console.log("Starting weekly newsletter job...");

    // Fetch news from multiple sources in parallel
    const [hackerNews, devTo, techNews] = await Promise.all([
      fetchHackerNewsStories(5),
      fetchDevToArticles(5),
      fetchNewsAPIArticles(5),
    ]);

    console.log(
      `Fetched articles: HN=${hackerNews.length}, DevTo=${devTo.length}, News=${techNews.length}`
    );

    // Get all active subscribers
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { status: "active" },
      select: { email: true },
    });

    console.log(`Sending newsletter to ${subscribers.length} subscribers`);

    if (subscribers.length === 0) {
      return apiSuccess({
        success: true,
        message: "No active subscribers",
        sent: 0,
      });
    }

    // Generate email template
    const emailTemplate = generateWeeklyNewsletterEmail(
      hackerNews,
      devTo,
      techNews
    );

    // Send to all subscribers
    let sent = 0;
    let failed = 0;

    for (const subscriber of subscribers) {
      try {
        // Replace placeholder with actual email for unsubscribe link
        const personalizedHtml = emailTemplate.replace(
          /\{\{EMAIL\}\}/g,
          encodeURIComponent(subscriber.email)
        );

        const result = await sendEmail({
          to: subscriber.email,
          subject: "☕ Your Weekly Tech Digest - Good Morning!",
          html: personalizedHtml,
        });

        if (result.success) {
          sent++;
        } else {
          failed++;
          console.warn(`Failed to send to ${subscriber.email}:`, result.error);
        }

        // Small delay to avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        failed++;
        console.error(`Error sending to ${subscriber.email}:`, error);
      }
    }

    console.log(`Newsletter complete: sent=${sent}, failed=${failed}`);

    // Log the send for tracking
    await prisma.emailLog.create({
      data: {
        to: `newsletter:${subscribers.length}`,
        subject: "Weekly Tech Digest",
        type: "weekly_newsletter",
        status: failed === 0 ? "sent" : "partial",
        errorMessage: failed > 0 ? `${failed} emails failed` : null,
      },
    });

    return apiSuccess({
      success: true,
      sent,
      failed,
      totalSubscribers: subscribers.length,
      articlesIncluded: {
        hackerNews: hackerNews.length,
        devTo: devTo.length,
        techNews: techNews.length,
      },
    });
  } catch (error) {
    console.error("Weekly newsletter cron error:", error);
    return apiError("Newsletter job failed", 500);
  }
}
