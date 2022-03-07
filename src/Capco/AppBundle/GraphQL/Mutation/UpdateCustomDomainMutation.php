<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Client\DeployerClient;
use Capco\AppBundle\Entity\SiteSettings;
use Capco\AppBundle\Enum\SiteSettingsStatus;
use Capco\AppBundle\Notifier\CustomDomainNotifier;
use Capco\AppBundle\Repository\SiteSettingsRepository;
use Capco\AppBundle\Validator\Constraints\CheckCustomDomainConstraint;
use Capco\AppBundle\Validator\Constraints\CheckCustomDomainSyntaxConstraint;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UpdateCustomDomainMutation implements MutationInterface
{
    public const CUSTOM_DOMAIN_SYNTAX_NOT_VALID = 'CUSTOM_DOMAIN_SYNTAX_NOT_VALID';
    public const ERROR_DEPLOYER_API = 'ERROR_DEPLOYER_API';
    public const CNAME_NOT_VALID = 'CNAME_NOT_VALID';

    private EntityManagerInterface $em;
    private SiteSettingsRepository $siteSettingsRepository;
    private LoggerInterface $logger;
    private DeployerClient $deployerClient;
    private ValidatorInterface $validator;

    public function __construct(
        EntityManagerInterface $em,
        SiteSettingsRepository $siteSettingsRepository,
        LoggerInterface        $logger,
        DeployerClient         $deployerClient,
        ValidatorInterface     $validator
    )
    {
        $this->em = $em;
        $this->siteSettingsRepository = $siteSettingsRepository;
        $this->logger = $logger;
        $this->deployerClient = $deployerClient;
        $this->validator = $validator;
    }

    public function __invoke(Argument $input, User $user): array
    {
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
            if ($message === self::CUSTOM_DOMAIN_SYNTAX_NOT_VALID) {
                $isCustomDomainSyntaxValid = false;
            }
            if ($message === self::CNAME_NOT_VALID) {
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
            if ($statusCode === 201) {
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
