<?php

namespace Capco\AppBundle\GraphQL\Mutation\AppearanceSettings;

use Capco\AppBundle\Entity\SiteImage;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\MediaRepository;
use Capco\AppBundle\Repository\SiteImageRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class UpdateAppearanceImageMutation implements MutationInterface
{
    use MutationTrait;

    final public const SITE_IMAGE_NOT_FOUND = 'SITE_IMAGE_NOT_FOUND';

    public function __construct(
        private readonly SiteImageRepository $repository,
        private readonly MediaRepository $mediaRepository,
        private readonly EntityManagerInterface $entityManager
    ) {
    }

    /**
     * @return array{siteImage?: SiteImage, errorCode?: string}
     */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);
        $siteImage = $this->repository->findOneBy(['id' => $input->offsetGet('id')]);

        if (!$siteImage instanceof SiteImage || 'settings.appearance' !== $siteImage->getCategory()) {
            return ['errorCode' => self::SITE_IMAGE_NOT_FOUND];
        }

        $siteImage->setMedia($input->offsetGet('mediaId') ? $this->mediaRepository->find($input->offsetGet('mediaId')) : null);
        $siteImage->setIsEnabled($input->offsetGet('isEnabled'));
        $this->entityManager->flush();
        $this->entityManager->getConfiguration()->getResultCacheImpl()->delete(SiteImageRepository::getValuesIfEnabledCacheKey());

        return ['siteImage' => $siteImage];
    }
}
