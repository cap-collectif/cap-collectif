<?php
namespace Capco\AppBundle\Mailer\Mailjet;

use Mailjet\Config;
use \Swift_Events_EventDispatcher;
use \Swift_Events_EventListener;
use \Swift_Events_SendEvent;
use \Swift_Transport;
use Capco\AppBundle\Mailer\Mailjet\MessageFormat\MessageFormatStrategyInterface;
use Capco\AppBundle\Mailer\Mailjet\MessageFormat\MessagePayloadV3;
use Capco\AppBundle\Mailer\Mailjet\MessageFormat\MessagePayloadV31;
use Mailjet\Client;
use Mailjet\Resources;

/**
 * https://github.com/mailjet/MailjetSwiftMailer
 */
class MailjetTransport implements Swift_Transport
{
    protected $eventDispatcher;
    protected $mailjetClient;

    /**
     * @var MessageFormatStrategyInterface
     */
    public $messageFormat;
    protected $apiKey;
    protected $apiSecret;
    protected $call;

    /**
     * url (Default: api.mailjet.com) : domain name of the API
     * version (Default: v3) : API version (only working for Mailjet API V3 +)
     * call (Default: true) : turns on(true) / off the call to the API
     * secured (Default: true) : turns on(true) / off the use of 'https'
     */
    protected $clientOptions;
    protected $resultApi;

    public function __construct(
        Swift_Events_EventDispatcher $eventDispatcher,
        Client $mailjetClient,
        string $version = Config::MAIN_VERSION
    ) {
        $this->eventDispatcher = $eventDispatcher;
        $this->mailjetClient = $mailjetClient;
        $this->setVersionPayload($version);
    }

    public function isStarted(): bool
    {
        return false;
    }

    public function start()
    {
    }

    public function stop()
    {
    }

    public function ping()
    {
    }

    public function send(\Swift_Mime_SimpleMessage $message, &$failedRecipients = null): int
    {
        $this->resultApi = null;
        $failedRecipients = (array) $failedRecipients;
        if ($event = $this->eventDispatcher->createSendEvent($this, $message)) {
            $this->eventDispatcher->dispatchEvent($event, 'beforeSendPerformed');
            if ($event->bubbleCancelled()) {
                return 0;
            }
        }
        $sendCount = 0;

        // extract Mailjet Message from SwiftMailer Message
        $mailjetMessage = $this->messageFormat->getMailjetMessage($message);

        try {
            // send API call
            $this->resultApi = $this->mailjetClient->post(Resources::$Email, [
                'body' => $mailjetMessage,
            ]);

            $sendCount = $this->findNumberOfSentMails();
            // get result
            if ($this->resultApi->success()) {
                $resultStatus = Swift_Events_SendEvent::RESULT_SUCCESS;
            } else {
                $resultStatus = Swift_Events_SendEvent::RESULT_FAILED;
            }
        } catch (\Exception $e) {
            $failedRecipients = $message->getTo();
            $sendCount = 0;
            $resultStatus = Swift_Events_SendEvent::RESULT_FAILED;
        }
        // Send SwiftMailer Event
        if ($event) {
            $event->setResult($resultStatus);
            $event->setFailedRecipients($failedRecipients);
            $this->eventDispatcher->dispatchEvent($event, 'sendPerformed');
        }
        return $sendCount;
    }

    public function bulkSend(array $messages, &$failedRecipients = null): int
    {
        $this->resultApi = null;
        $failedRecipients = (array) $failedRecipients;
        $bulkContainer = ['Messages' => []];
        $sendCount = 0;
        foreach ($messages as $message) {
            // extract Mailjet Message from SwiftMailer Message
            $mailjetMessage = $this->messageFormat->getMailjetMessage($message);

            /* No real bulk sending in v3.1. Even single message already
             * contains an array Messages.
             */
            if ($this->messageFormat->getVersion() === 'v3.1') {
                $bulkContainer['Messages'][] = $mailjetMessage['Messages'][0];
            } else {
                $bulkContainer['Messages'][] = $mailjetMessage;
            }
        }

        try {
            // send API call
            $this->resultApi = $this->mailjetClient->post(Resources::$Email, [
                'body' => $bulkContainer,
            ]);

            $sendCount = $this->findNumberOfSentMails();
            // get result
            if ($this->resultApi->success()) {
                $resultStatus = Swift_Events_SendEvent::RESULT_SUCCESS;
            } else {
                $resultStatus = Swift_Events_SendEvent::RESULT_FAILED;
            }
        } catch (\Exception $e) {
            //$failedRecipients = $mailjetMessage['Recipients'];
            $sendCount = 0;
            $resultStatus = Swift_Events_SendEvent::RESULT_FAILED;
        }

        return $sendCount;
    }

    private function findNumberOfSentMails(): int
    {
        $sendCount = 0;
        if ($this->messageFormat->getVersion() === 'v3.1') {
            $messages = $this->resultApi->getBody()['Messages'];
            foreach ($messages as $message) {
                if (isset($message['To'])) {
                    $sendCount += \count($message['To']);
                }
                if (isset($message['Bcc']) && !empty($message['Bcc'])) {
                    $sendCount += \count($message['Bcc']);
                }
                if (isset($message['Cc']) && !empty($message['Cc'])) {
                    $sendCount += \count($message['Cc']);
                }
            }
            return $sendCount;
        }
        if ($this->messageFormat->getVersion() === 'v3') {
            if (isset($this->resultApi->getBody()['Sent'])) {
                $sendCount += \count($this->resultApi->getBody()['Sent']);
            }

            return $sendCount;
        }

        return $sendCount;
    }

    public function registerPlugin(Swift_Events_EventListener $plugin): void
    {
        $this->eventDispatcher->bindEventListener($plugin);
    }

    public function setVersionPayload(string $version): self
    {
        $this->messageFormat =
            $version === 'v3.1' ? new MessagePayloadV31() : new MessagePayloadV3();

        return $this;
    }

    public function getResultApi(): ?array
    {
        return $this->resultApi;
    }
}
