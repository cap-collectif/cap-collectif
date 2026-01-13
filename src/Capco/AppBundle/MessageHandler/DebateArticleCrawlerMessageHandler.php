<?php

namespace Capco\AppBundle\MessageHandler;

use Capco\AppBundle\Crawler\DebateArticleMetadataCrawler;
use Capco\AppBundle\Message\DebateArticleCrawlerMessage;
use Capco\AppBundle\Repository\Debate\DebateArticleRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler(fromTransport: 'async', handles: DebateArticleCrawlerMessage::class)]
class DebateArticleCrawlerMessageHandler
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly DebateArticleRepository $repository,
        private readonly DebateArticleMetadataCrawler $metadataCrawler
    ) {
    }

    public function __invoke(DebateArticleCrawlerMessage $message): void
    {
        $articleId = $message->getDebateArticleId();
        $article = $this->repository->find(id: $articleId);
        if (null === $article) {
            throw new \RuntimeException(
                message: sprintf('Unable to find article with id : %s', $articleId)
            );
        }

        $this->metadataCrawler->completeArticle(debateArticle: $article);
        $this->entityManager->flush();
    }
}
