<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Repository\SiteImageRepository;
use Capco\AppBundle\SiteImage\SiteFaviconProcessor;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class RemoveSiteFaviconMutation implements MutationInterface
{
    private $siteImageRepository;
    private $siteFaviconProcessor;
    private $em;

    public function __construct(
        SiteImageRepository $siteImageRepository,
        SiteFaviconProcessor $siteFaviconProcessor,
        EntityManagerInterface $em
    ) {
        $this->siteImageRepository = $siteImageRepository;
        $this->em = $em;
        $this->siteFaviconProcessor = $siteFaviconProcessor;
    }

    public function __invoke(): array
    {
        $siteFavicon = $this->siteImageRepository->getSiteFavicon();

        if (!$siteFavicon) {
            throw new \RuntimeException('No site favicon entry!');
        }

        if ($siteFavicon->getMedia()) {
            $siteFavicon->setMedia(null);
            $this->em->flush();
        }

        $this->siteFaviconProcessor->process($siteFavicon);

        return compact('siteFavicon');
    }
}
