<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Repository\SiteImageRepository;
use Capco\AppBundle\SiteImage\SiteFaviconProcessor;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class RemoveSiteFaviconMutation implements MutationInterface
{
    public function __construct(private readonly SiteImageRepository $siteImageRepository, private readonly SiteFaviconProcessor $siteFaviconProcessor, private readonly EntityManagerInterface $em)
    {
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
