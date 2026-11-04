<?php

namespace Capco\AppBundle\GraphQL\Mutation\Reporting;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Interfaces\Trashable;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Enum\ModerateReportingAction;
use Capco\AppBundle\Enum\ModerateReportingErrorCode;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Model\Contribution;
use Capco\AppBundle\Notifier\ContributionNotifier;
use Capco\AppBundle\Repository\ReportingRepository;
use Doctrine\Common\Util\ClassUtils;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

/**
 * Archives a reporting, after moving the reported contribution to the trash if requested.
 * Same behavior as the archive, trash and disable actions of the Sonata ReportingController.
 */
class ModerateReportingMutation implements MutationInterface
{
    use MutationTrait;

    private const TRASHED_STATUS_BY_ACTION = [
        ModerateReportingAction::TRASH => Trashable::STATUS_VISIBLE,
        ModerateReportingAction::DISABLE => Trashable::STATUS_INVISIBLE,
    ];

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly ReportingRepository $reportingRepository,
        private readonly ContributionNotifier $contributionNotifier,
        private readonly Indexer $indexer
    ) {}

    /**
     * @return array{reporting: null|Reporting, errorCode: null|string}
     */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);

        $reporting = $this->reportingRepository->find($input->offsetGet('id'));
        if (!$reporting instanceof Reporting) {
            return ['reporting' => null, 'errorCode' => ModerateReportingErrorCode::REPORTING_NOT_FOUND];
        }

        $trashedStatus = self::TRASHED_STATUS_BY_ACTION[$input->offsetGet('action')] ?? null;
        $related = $reporting->getRelatedObject();
        if (null !== $trashedStatus) {
            if (!$related instanceof Trashable || !$related instanceof Contribution) {
                return ['reporting' => null, 'errorCode' => ModerateReportingErrorCode::REPORTED_CONTRIBUTION_NOT_FOUND];
            }
            $related->setTrashedStatus($trashedStatus);
        }

        $reporting->setIsArchived(true);
        $this->entityManager->flush();

        if (null !== $trashedStatus && $related instanceof Contribution) {
            $this->contributionNotifier->onModeration($related);
            // Synchronously index, so that the contribution leaves the public lists right away
            $this->indexer->index(ClassUtils::getClass($related), $related->getId());
            $this->indexer->finishBulk();
        }

        return ['reporting' => $reporting, 'errorCode' => null];
    }
}
