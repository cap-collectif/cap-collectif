<?php

namespace Capco\Tests\UnitTests;

use Capco\AppBundle\Crawler\DebateArticleMetadataCrawler;
use Capco\AppBundle\Entity\Debate\DebateArticle;
use PHPUnit\Framework\TestCase;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

/**
 * @internal
 * @coversNothing
 */
class DebateArticleMetadataCrawlerTest extends TestCase
{
    public function testCompleteArticleAppliesMetadata(): void
    {
        $url = 'news.example.com/articles/earth-flat';
        $title = 'Le chef de la NASA avoue avoir menti, la Terre est plate';
        $publishedAt = '2021-03-19T22:49:44+00:00';
        $origin = 'VRAIES INFOS';
        $image = '/images/cover.jpg';
        $description = 'Mais evidemment, cette info est cachee par tout le monde.';

        $html = <<<HTML
            <!doctype html>
            <html>
            <head>
                <title>{$title}</title>
                <meta property="og:title" content="{$title}">
                <meta property="og:site_name" content="{$origin}">
                <meta property="og:description" content="{$description}">
                <meta property="og:image" content="{$image}">
                <meta property="article:published_time" content="{$publishedAt}">
            </head>
            <body></body>
            </html>
            HTML;

        $response = $this->createMock(ResponseInterface::class);
        $response->expects($this->once())->method('getStatusCode')->willReturn(200);
        $response->expects($this->once())->method('getContent')->with(false)->willReturn($html);

        $httpClient = $this->createMock(HttpClientInterface::class);
        $httpClient
            ->expects($this->once())
            ->method('request')
            ->with(
                'GET',
                'https://news.example.com/articles/earth-flat',
                $this->callback(static fn (array $options): bool => isset($options['headers']['User-Agent'], $options['headers']['Accept'])
                    && 'CapcoMetadataCrawler/1.0' === $options['headers']['User-Agent']
                    && 'text/html,application/xhtml+xml' === $options['headers']['Accept']
                    && 5 === $options['max_redirects']
                    && 10.0 === $options['timeout'])
            )
            ->willReturn($response)
        ;

        $crawler = new DebateArticleMetadataCrawler(httpClient: $httpClient);
        $article = new DebateArticle();
        $article->setUrl(url: $url);

        $crawler->completeArticle(debateArticle: $article);

        $this->assertSame($title, $article->getTitle());
        $this->assertSame($origin, $article->getOrigin());
        $this->assertSame($description, $article->getDescription());
        $this->assertSame(
            'https://news.example.com/images/cover.jpg',
            $article->getCoverUrl()
        );
        $this->assertNotNull($article->getCrawledAt());
        $this->assertInstanceOf(
            \DateTimeInterface::class,
            $article->getCrawledAt()
        );
        $this->assertSame(
            $publishedAt,
            $article->getPublishedAt()?->format('c')
        );
    }

    public function testCompleteArticleHandlesIncompleteMetadata(): void
    {
        $url = 'news.example.com/articles/missing-tags';
        $title = 'Un titre sans description';
        $origin = 'VRAIES INFOS';

        $html = <<<HTML
            <!doctype html>
            <html>
            <head>
                <meta property="og:title" content="{$title}">
                <meta property="og:site_name" content="{$origin}">
            </head>
            <body></body>
            </html>
            HTML;

        $response = $this->createMock(ResponseInterface::class);
        $response->expects($this->once())->method('getStatusCode')->willReturn(200);
        $response->expects($this->once())->method('getContent')->with(false)->willReturn($html);

        $httpClient = $this->createMock(HttpClientInterface::class);
        $httpClient
            ->expects($this->once())
            ->method('request')
            ->with(
                'GET',
                'https://news.example.com/articles/missing-tags',
                $this->callback(static fn (array $options): bool => isset($options['headers']['User-Agent'], $options['headers']['Accept'])
                    && 'CapcoMetadataCrawler/1.0' === $options['headers']['User-Agent']
                    && 'text/html,application/xhtml+xml' === $options['headers']['Accept']
                    && 5 === $options['max_redirects']
                    && 10.0 === $options['timeout'])
            )
            ->willReturn($response)
        ;

        $crawler = new DebateArticleMetadataCrawler(httpClient: $httpClient);
        $article = new DebateArticle();
        $article->setUrl(url: $url);

        $crawler->completeArticle(debateArticle: $article);

        $this->assertSame($title, $article->getTitle());
        $this->assertSame($origin, $article->getOrigin());
        $this->assertNull($article->getDescription());
        $this->assertNull($article->getCoverUrl());
        $this->assertNotNull($article->getCrawledAt());
        $this->assertNull($article->getPublishedAt());
    }

    public function testCompleteArticleThrowsOnHttpError(): void
    {
        $url = 'https://news.example.com/articles/error';

        $response = $this->createMock(ResponseInterface::class);
        $response->expects($this->once())->method('getStatusCode')->willReturn(500);
        $response->expects($this->once())->method('getContent')->with(false)->willReturn('error');

        $httpClient = $this->createMock(HttpClientInterface::class);
        $httpClient
            ->expects($this->once())
            ->method('request')
            ->with('GET', $url, $this->isType('array'))
            ->willReturn($response)
        ;

        $crawler = new DebateArticleMetadataCrawler(httpClient: $httpClient);
        $article = new DebateArticle();
        $article->setUrl(url: $url);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('crawler error : HTTP 500 when fetching ' . $url);

        $crawler->completeArticle(debateArticle: $article);
    }
}
