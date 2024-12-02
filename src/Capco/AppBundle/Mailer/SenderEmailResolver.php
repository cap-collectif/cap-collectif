<?php

namespace Capco\AppBundle\Mailer;

use Capco\AppBundle\Repository\SenderEmailRepository;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;

class SenderEmailResolver
{
    private const GLOBAL_PARAMETER = 'admin.mail.notifications.send_address';
    private const ERROR_NO_CONF = 'sender email is configured neither by emailing parameters nor by global parameters';

    public function __construct(private readonly SiteParameterResolver $siteParams, private readonly SenderEmailRepository $repository)
    {
    }

    public function __invoke(): string
    {
        $senderEmail = $this->getFromRepository();

        if (null === $senderEmail) {
            $senderEmail = $this->getFromParameters();
        }

        if (null === $senderEmail) {
            throw new \Exception(self::ERROR_NO_CONF);
        }

        return $senderEmail;
    }

    private function getFromRepository(): ?string
    {
        $senderEmail = $this->repository->getDefault();

        return $senderEmail ? $senderEmail->getAddress() : null;
    }

    private function getFromParameters(): ?string
    {
        return $this->siteParams->getValue(self::GLOBAL_PARAMETER);
    }
}
