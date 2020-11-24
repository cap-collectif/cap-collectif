<?php

namespace Capco\AppBundle\Processor\Debate;

use Capco\AppBundle\Crawler\WebsiteMetadataCrawler;
use Capco\AppBundle\Repository\Debate\DebateArticleRepository;
use Doctrine\ORM\EntityManagerInterface;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class DebateArticleCrawlerProcessor implements ProcessorInterface
{
    private DebateArticleRepository $repository;
    private WebsiteMetadataCrawler $crawler;
    private EntityManagerInterface $em;

    public function __construct(EntityManagerInterface $em, DebateArticleRepository $repository, WebsiteMetadataCrawler $crawler)
    {
        $this->repository = $repository;
        $this->crawler = $crawler;
        $this->em = $em;
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode($message->getBody(), true);
        [$id, $url] = [$json['id'], $json['url']];
        $metadata = $this->crawler->crawl($url);
        $article = $this->repository->find($id);
        if (!$article) {
            throw new \RuntimeException('Unable to find article with id : ' . $id);
        }

        $article
            ->setTitle($metadata['title'])
            ->setCrawledAt($metadata['crawledAt'])
            ->setPublishedAt($metadata['publishedAt'])
            ->setOrigin($metadata['name'])
            ->setCoverUrl($metadata['image'])
            ->setDescription($metadata['description']);

        $this->em->flush();

        return true;
    }
}
