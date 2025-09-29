<?php

namespace Capco\AppBundle\Mailer\Transport;

use Capco\AppBundle\Entity\ExternalServiceConfiguration;
use Capco\AppBundle\Repository\ExternalServiceConfigurationRepository;
use Psr\Log\LoggerInterface;
use Swift_Events_EventListener;
use Swift_Mime_SimpleMessage;

class Transport implements \Swift_Transport
{
    public function __construct(
        private readonly MandrillTransport $mandrillTransport,
        private readonly MailjetTransport $mailjetTransport,
        private readonly \Swift_Events_EventDispatcher $dispatcher,
        private readonly ExternalServiceConfigurationRepository $externalServiceConfigurationRepository,
        private readonly LoggerInterface $logger
    ) {
    }

    /**
     * Not used.
     */
    public function isStarted()
    {
        return false;
    }

    /**
     * Not used.
     */
    public function start()
    {
    }

    /**
     * Not used.
     */
    public function stop()
    {
    }

    /**
     * Not used.
     */
    public function ping(): bool
    {
        return true;
    }

    public function send(Swift_Mime_SimpleMessage $message, &$failedRecipients = null)
    {
        //is it used ?
        if ($event = $this->dispatcher->createSendEvent($this, $message)) {
            $this->dispatcher->dispatchEvent($event, 'beforeSendPerformed');
            if ($event->bubbleCancelled()) {
                return 0;
            }
        }

        return $this->getTransport()->send($message, $failedRecipients, $event);
    }

    public function registerPlugin(Swift_Events_EventListener $plugin)
    {
        $this->mandrillTransport->registerPlugin($plugin);
    }

    public function setMandrillApiKey(?string $apiKey): self
    {
        $this->mandrillTransport->setApiKey($apiKey);

        return $this;
    }

    public function setMandrillAsync(?string $async): self
    {
        $this->mandrillTransport->setAsync($async);

        return $this;
    }

    public function setMailjetPublicKey(?string $key): self
    {
        $this->mailjetTransport->setPublicKey($key);

        return $this;
    }

    public function setMailjetPrivateKey(?string $key): self
    {
        $this->mailjetTransport->setPrivateKey($key);

        return $this;
    }

    public function getTransport()
    {
        $configuration = $this->getConfiguration();

        if ($configuration) {
            if ('mailjet' === $configuration->getValue()) {
                return $this->mailjetTransport;
            }
            if ('mandrill' === $configuration->getValue()) {
                return $this->mandrillTransport;
            }

            $this->logger->error('unknown mailer value : ' . $configuration->getValue());
        } else {
            $this->logger->error('no mailer configuration');
        }

        return $this->getFallbackTransport();
    }

    private function getFallbackTransport(): \Swift_Transport
    {
        return $this->mandrillTransport;
    }

    private function getConfiguration(): ?ExternalServiceConfiguration
    {
        return $this->externalServiceConfigurationRepository->findOneByType('mailer');
    }
}
