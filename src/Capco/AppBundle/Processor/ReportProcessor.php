<?php

namespace Capco\AppBundle\Processor;

use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Notifier\ReportNotifier;
use Capco\AppBundle\Repository\ReportingRepository;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class ReportProcessor implements ProcessorInterface
{
    private ReportNotifier $notifier;
    private ReportingRepository $repository;

    public function __construct(ReportNotifier $notifier, ReportingRepository $repository)
    {
        $this->notifier = $notifier;
        $this->repository = $repository;
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode($message->getBody(), true);

        $report = $this->getReport($json);
        if (!$report) {
            return false;
        }

        $this->notifier->onCreate($report);

        return true;
    }

    private function getReport(array $json): ?Reporting
    {
        return $this->repository->find($json['reportingId']);
    }
}
