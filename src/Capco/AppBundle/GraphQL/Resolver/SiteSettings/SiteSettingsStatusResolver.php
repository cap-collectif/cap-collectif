<?php

namespace Capco\AppBundle\GraphQL\Resolver\SiteSettings;

use Capco\AppBundle\Client\DeployerClient;
use Capco\AppBundle\Entity\SiteSettings ;
use Capco\AppBundle\Enum\SiteSettingsStatus;
use Capco\AppBundle\GraphQL\Mutation\UpdateCustomDomainMutation;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Notifier\CustomDomainNotifier;
use Capco\AppBundle\Repository\SiteSettingsRepository ;
use Capco\AppBundle\Validator\Constraints\CheckCustomDomainConstraint;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class SiteSettingsStatusResolver implements ResolverInterface
{
    use ResolverTrait;

    private SiteSettingsRepository $settingsRepository;
    private EntityManagerInterface $em;
    private ValidatorInterface $validator;
    private DeployerClient $deployerClient;
    private CustomDomainNotifier $notifier;
    private LoggerInterface $logger;

    public function __construct(
        SiteSettingsRepository $settingsRepository,
        EntityManagerInterface $em,
        ValidatorInterface $validator,
        DeployerClient $deployerClient,
        CustomDomainNotifier $notifier,
        LoggerInterface $logger
    )
    {
        $this->settingsRepository = $settingsRepository;
        $this->em = $em;
        $this->validator = $validator;
        $this->deployerClient = $deployerClient;
        $this->notifier = $notifier;
        $this->logger = $logger;
    }

    public function __invoke(SiteSettings $siteSettings, User $user): string
    {
        $customDomain = $siteSettings->getCustomDomain();

        $status = $siteSettings->getStatus();

        if ($status === SiteSettingsStatus::ACTIVE || $status === SiteSettingsStatus::IDLE) {
            return $status;
        }

        if (!$customDomain) {
            return $status;
        }

        $isCnameValid = true;
        $violations = $this->validator->validate($customDomain, new CheckCustomDomainConstraint());
        foreach ($violations as $violation) {
            if ($violation->getMessage() === UpdateCustomDomainMutation::CNAME_NOT_VALID) {
                $isCnameValid = false;
            }
        }

        if (!$isCnameValid) {
            return $status;
        }

        try {
            $statusCode = $this->deployerClient->addCustomDomain($customDomain);
            if ($statusCode !== 201) {
                return $status;
            }
            $siteSettings->setStatus(SiteSettingsStatus::ACTIVE);
            $this->em->flush();
            $this->notifier->onCreation($siteSettings, $user);
            return $siteSettings->getStatus();
        } catch (\Exception $e) {
            $this->logger->error(__METHOD__ . ' : ' . $e->getMessage());
            return $status;
        }
    }
}
