<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Client\DeployerClient;
use Capco\AppBundle\Entity\SiteSettings;
use Capco\AppBundle\Enum\SiteSettingsStatus;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\SiteSettingsRepository;
use Capco\AppBundle\Validator\Constraints\CheckCustomDomainConstraint;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UpdateCustomDomainMutation implements MutationInterface
{
    use MutationTrait;

    final public const CUSTOM_DOMAIN_SYNTAX_NOT_VALID = 'CUSTOM_DOMAIN_SYNTAX_NOT_VALID';
    final public const ERROR_DEPLOYER_API = 'ERROR_DEPLOYER_API';
    final public const CNAME_NOT_VALID = 'CNAME_NOT_VALID';

    public function __construct(private readonly EntityManagerInterface $em, private readonly SiteSettingsRepository $siteSettingsRepository, private readonly LoggerInterface $logger, private readonly DeployerClient $deployerClient, private readonly ValidatorInterface $validator)
    {
    }

    public function __invoke(Argument $input, User $user): array
    {
        $this->formatInput($input);
        $customDomain = $input->offsetGet('customDomain');

        $siteSettings = $this->siteSettingsRepository->findSiteSetting() ?? new SiteSettings();
        $siteSettings->setCustomDomain($customDomain);

        if (empty($customDomain)) {
            $siteSettings->setStatus(SiteSettingsStatus::IDLE);
            $this->em->persist($siteSettings);
            $this->em->flush();

            return ['siteSettings' => $siteSettings, 'errorCode' => null];
        }

        $isCustomDomainSyntaxValid = true;
        $isCustomDomainCnameValid = true;
        $violations = $this->validator->validate($customDomain, new CheckCustomDomainConstraint());

        foreach ($violations as $violation) {
            $message = $violation->getMessage();
            if (self::CUSTOM_DOMAIN_SYNTAX_NOT_VALID === $message) {
                $isCustomDomainSyntaxValid = false;
            }
            if (self::CNAME_NOT_VALID === $message) {
                $isCustomDomainCnameValid = false;
            }
        }

        if (!$isCustomDomainSyntaxValid) {
            return ['siteSettings' => $siteSettings, 'errorCode' => self::CUSTOM_DOMAIN_SYNTAX_NOT_VALID];
        }

        if (!$isCustomDomainCnameValid) {
            return ['siteSettings' => $siteSettings, 'errorCode' => self::CNAME_NOT_VALID];
        }

        try {
            $statusCode = $this->deployerClient->updateCurrentDomain($customDomain);
            if (201 === $statusCode) {
                $siteSettings->setStatus(SiteSettingsStatus::ACTIVE);
                $this->em->persist($siteSettings);
                $this->em->flush();

                return ['siteSettings' => $siteSettings, 'errorCode' => null];
            }

            return ['siteSettings' => $siteSettings, 'errorCode' => self::ERROR_DEPLOYER_API];
        } catch (\Exception $e) {
            $this->logger->error(__METHOD__ . ' => ' . $e->getCode() . ' : ' . $e->getMessage());

            return ['siteSettings' => $siteSettings, 'errorCode' => self::ERROR_DEPLOYER_API];
        }
    }
}
