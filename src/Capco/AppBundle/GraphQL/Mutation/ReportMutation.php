<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Model\ReportableInterface;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;

class ReportMutation implements MutationInterface
{
    public const REPORTABLE_NOT_FOUND = 'REPORTABLE_NOT_FOUND';
    public const ALREADY_REPORTED = 'ALREADY_REPORTED';

    private GlobalIdResolver $globalIdResolver;
    private EntityManagerInterface $em;
    private Publisher $publisher;

    public function __construct(
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $em,
        Publisher $publisher
    ) {
        $this->globalIdResolver = $globalIdResolver;
        $this->em = $em;
        $this->publisher = $publisher;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        try {
            $reportable = $this->getReportable($input, $viewer);
            self::checkNotAlreadyReported($reportable, $viewer);
            $report = self::generateReporting($reportable, $input, $viewer);
            $this->em->persist($report);
            $this->em->flush();
            $this->notify($report);

            return ['report' => $report];
        } catch (UserError $error) {
            return ['errorCode' => $error->getMessage()];
        }
    }

    private function getReportable(Arg $input, User $viewer): ReportableInterface
    {
        $reportable = $this->globalIdResolver->resolve($input->offsetGet('reportableId'), $viewer);
        if (!($reportable instanceof ReportableInterface)) {
            throw new UserError(self::REPORTABLE_NOT_FOUND);
        }

        return $reportable;
    }

    private static function generateReporting(
        ReportableInterface $reportable,
        Arg $input,
        User $viewer
    ): Reporting {
        $reporting = new Reporting();
        $reporting->setReporter($viewer);
        $reporting->setRelatedObject($reportable);
        $reporting->setBody($input->offsetGet('body'));
        $reporting->setStatus($input->offsetGet('type'));

        $reportable->addReport($reporting);

        return $reporting;
    }

    private static function checkNotAlreadyReported(
        ReportableInterface $reportable,
        User $viewer
    ): void {
        foreach ($reportable->getReports() as $report) {
            if ($report->getReporter() === $viewer) {
                throw new UserError(self::ALREADY_REPORTED);
            }
        }
    }

    private function notify(Reporting $reporting): void
    {
        $this->publisher->publish(
            CapcoAppBundleMessagesTypes::REPORT,
            new Message(
                json_encode([
                    'reportingId' => $reporting->getId(),
                ])
            )
        );
    }
}
