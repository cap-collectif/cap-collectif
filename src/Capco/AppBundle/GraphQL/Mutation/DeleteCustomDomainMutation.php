<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Client\DeployerClient;
use Capco\AppBundle\Enum\SiteSettingsStatus;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\SiteSettingsRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class DeleteCustomDomainMutation implements MutationInterface
{
    use MutationTrait;

    final public const ERROR_DEPLOYER_API = 'ERROR_DEPLOYER_API';

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly SiteSettingsRepository $siteSettingsRepository,
        private readonly DeployerClient $deployerClient
    ) {
    }

    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);
        $siteSettings = $this->siteSettingsRepository->findSiteSetting();
        $capcoDomain = $siteSettings->getCapcoDomain();

        try {
            $statusCode = $this->deployerClient->updateCurrentDomain($capcoDomain);
        } catch (\Exception) {
            return ['siteSettings' => $siteSettings, 'errorCode' => self::ERROR_DEPLOYER_API];
        }

        if (201 === $statusCode) {
            $siteSettings->setCustomDomain(null);
            $siteSettings->setStatus(SiteSettingsStatus::IDLE);
            $this->em->flush();

            return ['siteSettings' => $siteSettings, 'errorCode' => null];
        }

        return ['siteSettings' => $siteSettings, 'errorCode' => self::ERROR_DEPLOYER_API];
    }
}
