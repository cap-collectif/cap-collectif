<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Repository\SiteImageRepository;
use Capco\AppBundle\SiteImage\SiteFaviconProcessor;
use Capco\MediaBundle\Repository\MediaRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class ChangeSiteFaviconMutation implements MutationInterface
{
    private $siteImageRepository;
    private $mediaRepository;
    private $em;
    private $siteFaviconProcessor;

    public function __construct(
        SiteImageRepository $siteImageRepository,
        SiteFaviconProcessor $siteFaviconProcessor,
        EntityManagerInterface $em,
        MediaRepository $mediaRepository
    ) {
        $this->siteImageRepository = $siteImageRepository;
        $this->mediaRepository = $mediaRepository;
        $this->em = $em;
        $this->siteFaviconProcessor = $siteFaviconProcessor;
    }

    public function __invoke(Argument $input): array
    {
        $mediaId = $input->offsetGet('mediaId');

        $media = $this->mediaRepository->find($mediaId);
        $siteFavicon = $this->siteImageRepository->getSiteFavicon();

        if (!$siteFavicon) {
            throw new \RuntimeException('No site favicon entry!');
        }

        if (!$media) {
            throw new UserError('Media not found!');
        }

        $siteFavicon->setMedia($media);

        $this->em->flush();

        $this->siteFaviconProcessor->process($siteFavicon);

        return compact('siteFavicon');
    }
}
