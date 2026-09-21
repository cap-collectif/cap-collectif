<?php

namespace Capco\AppBundle\GraphQL\Mutation\PerformanceSettings;

use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\GraphQL\Mutation\UpdateSiteParameterMutation;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class UpdatePerformanceSettingMutation implements MutationInterface
{
    use MutationTrait;

    final public const SITE_PARAMETER_NOT_FOUND = 'SITE_PARAMETER_NOT_FOUND';
    final public const INVALID_VALUE = 'INVALID_VALUE';

    final public const CATEGORY = 'settings.performance';

    public function __construct(
        private readonly SiteParameterRepository $repository,
        private readonly EntityManagerInterface $entityManager,
        private readonly UpdateSiteParameterMutation $updateSiteParameterMutation
    ) {
    }

    /**
     * @return array{siteParameter?: SiteParameter, errorCode?: string}
     */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);

        try {
            $siteParameter = $this->getSiteParameter($input);
            $value = (string) $input->offsetGet('value');
            self::checkValue($siteParameter, $value);
            $siteParameter->setValue($value);
            $siteParameter->setIsEnabled((bool) $input->offsetGet('isEnabled'));
            $this->entityManager->flush();
        } catch (UserError $error) {
            return ['errorCode' => $error->getMessage()];
        }

        $this->updateSiteParameterMutation->invalidateCache($siteParameter);

        return ['siteParameter' => $siteParameter];
    }

    private function getSiteParameter(Argument $input): SiteParameter
    {
        $siteParameter = $this->repository->find($input->offsetGet('id'));

        if (!$siteParameter instanceof SiteParameter || self::CATEGORY !== $siteParameter->getCategory()) {
            throw new UserError(self::SITE_PARAMETER_NOT_FOUND);
        }

        return $siteParameter;
    }

    private static function checkValue(SiteParameter $siteParameter, string $value): void
    {
        if (SiteParameter::TYPE_INTEGER === (int) $siteParameter->getType() && (!ctype_digit($value) || (int) $value <= 0)) {
            throw new UserError(self::INVALID_VALUE);
        }
    }
}
