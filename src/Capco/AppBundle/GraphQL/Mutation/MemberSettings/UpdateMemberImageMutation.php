<?php

namespace Capco\AppBundle\GraphQL\Mutation\MemberSettings;

use Capco\AppBundle\Entity\SiteImage;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\MediaRepository;
use Capco\AppBundle\Repository\SiteImageRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class UpdateMemberImageMutation implements MutationInterface
{
    use MutationTrait;

    final public const MEMBER_IMAGE_NOT_FOUND = 'MEMBER_IMAGE_NOT_FOUND';

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

        try {
            $siteImage = $this->repository->find($input->offsetGet('id'));
            if (!$siteImage instanceof SiteImage || 'pages.members' !== $siteImage->getCategory()) {
                throw new UserError(self::MEMBER_IMAGE_NOT_FOUND);
            }

            $mediaId = $input->offsetGet('mediaId');
            $siteImage->setMedia($mediaId ? $this->mediaRepository->find($mediaId) : null);
            $siteImage->setIsEnabled((bool) $input->offsetGet('isEnabled'));
            $this->entityManager->flush();
        } catch (UserError $error) {
            return ['errorCode' => $error->getMessage()];
        }

        $cacheDriver = $this->entityManager->getConfiguration()->getResultCacheImpl();
        $cacheDriver->delete(SiteImageRepository::getValuesIfEnabledCacheKey());

        return ['siteImage' => $siteImage];
    }
}
