<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\MediaRepository;
use Capco\AppBundle\Repository\SiteImageRepository;
use Capco\AppBundle\SiteImage\SiteFaviconProcessor;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class ChangeSiteFaviconMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(private SiteImageRepository $siteImageRepository, private SiteFaviconProcessor $siteFaviconProcessor, private EntityManagerInterface $em, private MediaRepository $mediaRepository)
    {
    }

    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);
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
