<?php

namespace Capco\AppBundle\Crawler;

use Capco\AppBundle\Entity\Debate\DebateArticle;

class PantherServiceCaller
{
    private const PARAMETER_KEY_TOKEN = 'capco-token';
    private const PARAMETER_KEY_URL = 'url';

    private string $pantherUrl;
    private string $pantherToken;

    public function __construct(string $pantherUrl, string $pantherToken)
    {
        $this->pantherUrl = $pantherUrl;
        $this->pantherToken = $pantherToken;
    }

    public function completeArticle(DebateArticle $debateArticle): DebateArticle
    {
        if (null === $debateArticle->getUrl()) {
            throw new \RuntimeException('no url in debateArticle');
        }
        $metadata = $this->call($debateArticle->getUrl());
        if (isset($metadata['error']) && null !== $metadata['error']) {
            throw new \RuntimeException('panther error : ' . $metadata['error']);
        }

        return self::applyDataOnArticle($debateArticle, $metadata);
    }

    public function call(string $url): array
    {
        $result = file_get_contents($this->createUrl($url));

        return json_decode($result, true);
    }

    private static function applyDataOnArticle(
        DebateArticle $debateArticle,
        array $metadata
    ): DebateArticle {
        if (isset($metadata['title'])) {
            $debateArticle->setTitle($metadata['title']);
        }
        if (isset($metadata['name'])) {
            $debateArticle->setOrigin($metadata['name']);
        }
        if (isset($metadata['description'])) {
            $debateArticle->setDescription($metadata['description']);
        }
        if (isset($metadata['image'])) {
            $debateArticle->setCoverUrl($metadata['image']);
        }
        if (isset($metadata['crawledAt'])) {
            $debateArticle->setCrawledAt(new \DateTime($metadata['crawledAt']['date']));
        }
        if (isset($metadata['publishedAt'])) {
            $debateArticle->setPublishedAt(new \DateTime($metadata['publishedAt']['date']));
        }

        return $debateArticle;
    }

    private function createUrl(string $url): string
    {
        if ('INSERT_A_REAL_SECRET' === $this->pantherUrl || 'INSERT_A_REAL_SECRET' === $this->pantherToken) {
            throw new \RuntimeException('pantherUrl or pantherToken is not set');
        }

        return $this->pantherUrl .
            '?' .
            self::PARAMETER_KEY_TOKEN .
            '=' .
            $this->pantherToken .
            '&' .
            self::PARAMETER_KEY_URL .
            '=' .
            $url;
    }
}
