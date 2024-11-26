<?php

namespace Capco\AppBundle\Sentry;

use BGalati\MonologSentryHandler\SentryHandler as MonologSentryHandler;
use Capco\AppBundle\Toggle\Manager;
use Monolog\Logger;
use Sentry\State\HubInterface;

class SentryHandler extends MonologSentryHandler
{
    protected HubInterface $hub;
    private readonly ?Manager $toggleManager;

    /**
     * {@inheritdoc}
     */
    public function __construct(
        HubInterface $hub,
        int $level = Logger::DEBUG,
        bool $bubble = true,
        ?Manager $toggleManager = null
    ) {
        parent::__construct($hub, $level, $bubble);
        $this->toggleManager = $toggleManager;
        $this->hub = $hub;
    }

    /**
     * {@inheritdoc}
     */
    protected function write(array $record): void
    {
        if ($this->isSentryEnable()) {
            parent::write($record);
        }
    }

    private function isSentryEnable(): bool
    {
        try {
            return $this->toggleManager->isActive('sentry_log');
        } catch (\Exception $e) {
            return false;
        }
    }
}
