<?php

namespace Capco\AppBundle\GraphQL\Mutation\FooterSettings;

use Capco\AppBundle\Entity\SiteColor;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\SiteColorRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class UpdateFooterColorMutation implements MutationInterface
{
    use MutationTrait;

    final public const SITE_COLOR_NOT_FOUND = 'SITE_COLOR_NOT_FOUND';

    public function __construct(
        private readonly SiteColorRepository $repository,
        private readonly EntityManagerInterface $entityManager
    ) {
    }

    /** @return array{siteColor?: SiteColor, errorCode?: string} */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);
        $color = $this->repository->find($input->offsetGet('id'));

        if (!$color instanceof SiteColor || 'pages.footer' !== $color->getCategory()) {
            return ['errorCode' => self::SITE_COLOR_NOT_FOUND];
        }

        $color->setValue($input->offsetGet('value'));
        $color->setIsEnabled($input->offsetGet('isEnabled'));
        $this->entityManager->flush();
        $this->entityManager->getConfiguration()->getResultCacheImpl()->delete(SiteColorRepository::getValuesIfEnabledCacheKey());

        return ['siteColor' => $color];
    }
}
