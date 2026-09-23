<?php

namespace Capco\AppBundle\GraphQL\Mutation\AppearanceSettings;

use Capco\AppBundle\Entity\SiteColor;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\SiteColorRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class UpdateAppearanceColorMutation implements MutationInterface
{
    use MutationTrait;

    final public const SITE_COLOR_NOT_FOUND = 'SITE_COLOR_NOT_FOUND';

    public function __construct(
        private readonly SiteColorRepository $repository,
        private readonly EntityManagerInterface $entityManager
    ) {
    }

    /**
     * @return array{siteColor?: SiteColor, errorCode?: string}
     */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);
        $siteColor = $this->repository->findOneBy(['id' => $input->offsetGet('id')]);

        if (!$siteColor instanceof SiteColor || 'settings.appearance' !== $siteColor->getCategory()) {
            return ['errorCode' => self::SITE_COLOR_NOT_FOUND];
        }

        $siteColor->setValue($input->offsetGet('value'));
        $siteColor->setIsEnabled($input->offsetGet('isEnabled'));
        $this->entityManager->flush();
        $this->entityManager->getConfiguration()->getResultCacheImpl()->delete(SiteColorRepository::getValuesIfEnabledCacheKey());

        return ['siteColor' => $siteColor];
    }
}
