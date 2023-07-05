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

        return $this->updateLocalDomains($domains);
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

    private function updateLocalDomains(array $domains): array
    {
        $hasChange = false;
        foreach ($domains as $domain) {
            if ($this->updateDomain($domain)) {
                $hasChange = true;
            }
        }

        if ($hasChange) {
            $this->em->flush();
        }

        return $domains;
    }

    private function updateDomain(SenderEmailDomain $domain): bool
    {
        $serviceDomain = self::getMatchingServiceDomain($domain);
        if ($serviceDomain && self::updateDomainFromService($domain, $serviceDomain)) {
            return true;
        }

        return false;
    }

    private static function updateDomainFromService(
        SenderEmailDomain $domain,
        SenderEmailDomain $serviceDomain
    ): bool {
        $domain->setTxtKey($serviceDomain->getTxtKey());
        $domain->setTxtValue($serviceDomain->getTxtValue());
        $domain->setTxtValidation($serviceDomain->getTxtValidation());
        if (self::hasChangeInValidation($domain, $serviceDomain)) {
            $domain->setDkimValidation($serviceDomain->getDkimValidation());
            $domain->setSpfValidation($serviceDomain->getSpfValidation());

            return true;
        }

        return false;
    }

    private function getMatchingServiceDomain(SenderEmailDomain $domain): ?SenderEmailDomain
    {
        if (ExternalServiceConfiguration::MAILER_MANDRILL === $domain->getService()) {
            return $this->mandrillClient->getSenderEmailDomain($domain);
        }

        return $this->mailjetClient->getSenderEmailDomain($domain->getValue());
    }

    private static function hasChangeInValidation(
        SenderEmailDomain $domain,
        SenderEmailDomain $serviceDomain
    ): bool {
        return $domain->getSpfValidation() !== $serviceDomain->getSpfValidation()
            || $domain->getDkimValidation() !== $serviceDomain->getDkimValidation();
    }
}
