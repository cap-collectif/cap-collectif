<?php

namespace Capco\AppBundle\Processor\Debate;

use Capco\AppBundle\Crawler\PantherServiceCaller;
use Capco\AppBundle\Repository\Debate\DebateArticleRepository;
use Doctrine\ORM\EntityManagerInterface;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class DebateArticleCrawlerProcessor implements ProcessorInterface
{
    private readonly DebateArticleRepository $repository;
    private readonly PantherServiceCaller $pantherServiceCaller;
    private readonly EntityManagerInterface $em;

    public function __construct(
        EntityManagerInterface $em,
        DebateArticleRepository $repository,
        PantherServiceCaller $pantherServiceCaller
    ) {
        $this->repository = $repository;
        $this->em = $em;
        $this->pantherServiceCaller = $pantherServiceCaller;
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode((string) $message->getBody(), true);
        $article = $this->repository->find($json['id']);
        if (!$article) {
            throw new \RuntimeException('Unable to find article with id : ' . $json['id']);
        }

        $this->pantherServiceCaller->completeArticle($article);
        $this->em->flush();

        return true;
    }
}
