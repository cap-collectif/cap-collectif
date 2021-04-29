<?php

namespace Capco\AppBundle\Mailer\Transport;

use Capco\AppBundle\Entity\ExternalServiceConfiguration;
use Capco\AppBundle\Repository\ExternalServiceConfigurationRepository;
use Swift_Events_EventListener;
use Swift_Mime_SimpleMessage;

class Transport implements \Swift_Transport
{
    private MandrillTransport $mandrillTransport;
    private MailjetTransport $mailjetTransport;
    private \Swift_Events_EventDispatcher $dispatcher;
    private ExternalServiceConfiguration $configuration;

    public function __construct(
        MandrillTransport $mandrillTransport,
        MailjetTransport $mailjetTransport,
        \Swift_Events_EventDispatcher $dispatcher,
        ExternalServiceConfigurationRepository $externalServiceConfigurationRepository
    ) {
        $this->mandrillTransport = $mandrillTransport;
        $this->mailjetTransport = $mailjetTransport;
        $this->dispatcher = $dispatcher;
        $this->configuration = $externalServiceConfigurationRepository->findOneByType('mailer');
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
    public function ping()
    {
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

    private function getTransport()
    {
        if ('mailjet' === $this->configuration->getValue()) {
            return $this->mailjetTransport;
        }
        if ('mandrill' === $this->configuration->getValue()) {
            return $this->mandrillTransport;
        }

        throw new \Exception('unknown mailer value : ' . $this->configuration->getValue());
    }
}
