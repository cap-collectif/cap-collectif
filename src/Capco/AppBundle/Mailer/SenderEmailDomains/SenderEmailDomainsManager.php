<?php

namespace Capco\AppBundle\Mailer\SenderEmailDomains;

use Capco\AppBundle\Entity\ExternalServiceConfiguration;
use Capco\AppBundle\Entity\SenderEmailDomain;
use Capco\AppBundle\Repository\SenderEmailDomainRepository;
use Doctrine\ORM\EntityManagerInterface;

class SenderEmailDomainsManager
{
    private string $environment;
    private SenderEmailDomainRepository $repository;
    private EntityManagerInterface $em;
    private MailjetClient $mailjetClient;
    private MandrillClient $mandrillClient;

    public function __construct(
        string $environment,
        SenderEmailDomainRepository $repository,
        EntityManagerInterface $em,
        MailjetClient $mailjetClient,
        MandrillClient $mandrillClient
    ) {
        $this->environment = $environment;
        $this->repository = $repository;
        $this->em = $em;
        $this->mailjetClient = $mailjetClient;
        $this->mandrillClient = $mandrillClient;
    }

    public function getSenderEmailDomains(): array
    {
        $domains = $this->repository->findAll();

        if ('test' === $this->environment) {
            return $domains;
        }

        $mailjetDomains = $this->mailjetClient->getSenderEmailDomains();
        $mandrillDomains = $this->mandrillClient->getSenderEmailDomains();

        return $this->updateLocalDomains($domains, $mailjetDomains, $mandrillDomains);
    }

    public function createSenderEmailDomain(string $domain, string $service): SenderEmailDomain
    {
        $senderEmailDomain = (new SenderEmailDomain())->setService($service)->setValue($domain);

        if ('test' === $this->environment) {
            return $senderEmailDomain;
        }

        if (ExternalServiceConfiguration::MAILER_MAILJET === $service) {
            $senderEmailDomain = $this->mailjetClient->createSenderDomain($senderEmailDomain);
        } else {
            $senderEmailDomain = $this->mandrillClient->createSenderDomain($senderEmailDomain);
        }

        return $senderEmailDomain;
    }

    private function updateLocalDomains(
        array $domains,
        array $mailjetDomains,
        array $mandrillDomains
    ): array {
        $hasChange = false;
        foreach ($domains as $domain) {
            if ($this->updateDomain($domain, $mailjetDomains, $mandrillDomains)) {
                $hasChange = true;
            }
        }

        if ($hasChange) {
            $this->em->flush();
        }

        return $domains;
    }

    private function updateDomain(
        SenderEmailDomain $domain,
        array $mailjetDomains,
        array $mandrillDomains
    ): bool {
        $serviceDomain = self::getMatchingServiceDomain($domain, $mailjetDomains, $mandrillDomains);
        if ($serviceDomain && self::updateDomainFromService($domain, $serviceDomain)) {
            return true;
        }

        return false;
    }

    private static function updateDomainFromService(
        SenderEmailDomain $domain,
        SenderEmailDomain $serviceDomain
    ): bool {
        if (self::hasChangeInValidation($domain, $serviceDomain)) {
            $domain->setDkimValidation($serviceDomain->getDkimValidation());
            $domain->setSpfValidation($serviceDomain->getSpfValidation());

            return true;
        }

        return false;
    }

    private static function getMatchingServiceDomain(
        SenderEmailDomain $domain,
        array $mailjetDomains,
        array $mandrillDomains
    ): ?SenderEmailDomain {
        foreach (
            self::getServiceRelatedData($mailjetDomains, $mandrillDomains, $domain->getService())
            as $serviceDomain
        ) {
            if (self::doesSenderEmailsMatch($domain, $serviceDomain)) {
                return $serviceDomain;
            }
        }

        return null;
    }

    private static function getServiceRelatedData(
        array $mailjetDomains,
        array $mandrillDomains,
        string $service
    ): array {
        return ExternalServiceConfiguration::MAILER_MAILJET === $service
            ? $mailjetDomains
            : $mandrillDomains;
    }

    private static function hasChangeInValidation(
        SenderEmailDomain $domain,
        SenderEmailDomain $serviceDomain
    ): bool {
        return $domain->getSpfValidation() !== $serviceDomain->getSpfValidation() ||
            $domain->getDkimValidation() !== $serviceDomain->getDkimValidation();
    }

    private static function doesSenderEmailsMatch(
        SenderEmailDomain $domain,
        SenderEmailDomain $serviceDomain
    ): bool {
        return $domain->getValue() === $serviceDomain->getValue() &&
            $domain->getService() === $serviceDomain->getService();
    }
}
