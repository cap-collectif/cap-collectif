<?php

namespace Capco\AppBundle\Message;

class DebateArticleCrawlerMessage
{
    public function __construct(private readonly string $debateArticleId)
    {
    }

    public function getDebateArticleId(): string
    {
        return $this->debateArticleId;
    }
}
