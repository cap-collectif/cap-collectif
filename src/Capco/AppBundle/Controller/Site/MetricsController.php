<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Repository\AbstractVoteRepository;
use Capco\AppBundle\Repository\ArgumentRepository;
use Capco\AppBundle\Repository\CommentRepository;
use Capco\AppBundle\Repository\FollowerRepository;
use Capco\AppBundle\Repository\NewsletterSubscriptionRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\ReplyRepository;
use Capco\AppBundle\Repository\ReportingRepository;
use Capco\AppBundle\Repository\SourceRepository;
use Capco\UserBundle\Repository\UserRepository;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use TweedeGolf\PrometheusClient\CollectorRegistry;
use TweedeGolf\PrometheusClient\Format\TextFormatter;

class MetricsController extends Controller
{
    /**
     * @Route("/metrics", name="capco_metrics")
     */
    public function metricsAction(Request $request): Response
    {
        if (
            'prod' === $this->getParameter('kernel.environment') &&
            $request->headers->get('Authorization') !==
                $this->getParameter('prometheus_bearer_token')
        ) {
            $this->createAccessDeniedException();
        }

        $registry = $this->get(CollectorRegistry::class);
        $formatter = new TextFormatter();

        $registeredContributorCount = $this->get(
            UserRepository::class
        )->getRegisteredContributorCount();

        $registeredConfirmedByEmail = $this->get(UserRepository::class)->getRegisteredCount();

        $registeredNotConfirmedByEmail = $this->get(
            UserRepository::class
        )->getRegisteredNotConfirmedByEmailCount();

        $commentCount = $this->get(CommentRepository::class)->countPublished();
        $voteCount = $this->get(AbstractVoteRepository::class)->countPublished();
        $voteUnpublishedCount = $this->get(AbstractVoteRepository::class)->countUnpublished();

        $opinionCount = $this->get(OpinionRepository::class)->countPublished();
        $versionCount = $this->get(OpinionVersionRepository::class)->countPublished();
        $argumentCount = $this->get(ArgumentRepository::class)->countPublished();
        $sourceCount = $this->get(SourceRepository::class)->countPublished();
        $proposalCount = $this->get(ProposalRepository::class)->countPublished();
        $replyCount = $this->get(ReplyRepository::class)->countPublished();

        $contributionCount =
            $opinionCount +
            $versionCount +
            $argumentCount +
            $sourceCount +
            $proposalCount +
            $replyCount;

        $contributionTrashedCount = 0;
        $contributionTrashedCount += $this->get(OpinionRepository::class)->countTrashed();
        $contributionTrashedCount += $this->get(OpinionVersionRepository::class)->countTrashed();
        $contributionTrashedCount += $this->get(ArgumentRepository::class)->countTrashed();
        $contributionTrashedCount += $this->get(SourceRepository::class)->countTrashed();
        $contributionTrashedCount += $this->get(ProposalRepository::class)->countTrashed();

        $contributionUnpublishedCount = 0;
        $contributionUnpublishedCount += $this->get(OpinionRepository::class)->countUnpublished();
        $contributionUnpublishedCount += $this->get(
            OpinionVersionRepository::class
        )->countUnpublished();
        $contributionUnpublishedCount += $this->get(ArgumentRepository::class)->countUnpublished();
        $contributionUnpublishedCount += $this->get(SourceRepository::class)->countUnpublished();
        $contributionUnpublishedCount += $this->get(ProposalRepository::class)->countUnpublished();

        $projectCount = \count(
            $this->get(ProjectRepository::class)->findBy([
                'visibility' => ProjectVisibilityMode::VISIBILITY_PUBLIC,
            ])
        );
        $steps = $this->get(AbstractStepRepository::class)->findAll();
        $contribuableStepsCount = \count(
            array_reduce($steps, function ($step) {
                return $step && $step->canContribute($this->getUser());
            })
        );

        $reportCount = \count($this->get(ReportingRepository::class)->findAll());
        // Traité ou non ?
        $reportArchivedCount = \count(
            $this->get(ReportingRepository::class)->findBy(['isArchived' => true])
        );

        // Followers
        $followerCount = \count($this->get(FollowerRepository::class)->findAll());

        // Newsletter inscription
        $newsletterSubscriptionCount = \count(
            $this->get(NewsletterSubscriptionRepository::class)->findAll()
        );

        // Theme
        // Blog
        // Event
        // Event registration
        // Group ?
        // District ?

        $registry->getGauge('registeredConfirmedByEmail')->set($registeredConfirmedByEmail);
        $registry->getGauge('registeredNotConfirmedByEmail')->set($registeredNotConfirmedByEmail);
        $registry->getGauge('registeredContributors')->set($registeredContributorCount);
        $registry->getGauge('projectCount')->set($projectCount);
        $registry->getGauge('contribuableStepsCount')->set($contribuableStepsCount);
        $registry->getGauge('voteCount')->set($voteCount);
        $registry->getGauge('voteUnpublishedCount')->set($voteUnpublishedCount);
        $registry->getGauge('commentCount')->set($commentCount);
        $registry->getGauge('contributionCount')->set($contributionCount);
        $registry->getGauge('opinionCount')->set($opinionCount);
        $registry->getGauge('versionCount')->set($versionCount);
        $registry->getGauge('argumentCount')->set($argumentCount);
        $registry->getGauge('sourceCount')->set($sourceCount);
        $registry->getGauge('proposalCount')->set($proposalCount);
        $registry->getGauge('replyCount')->set($replyCount);
        $registry->getGauge('reportCount')->set($reportCount);
        $registry->getGauge('reportArchivedCount')->set($reportArchivedCount);
        $registry->getGauge('followerCount')->set($followerCount);
        $registry->getGauge('contributionTrashedCount')->set($contributionTrashedCount);
        $registry->getGauge('contributionUnpublishedCount')->set($contributionUnpublishedCount);
        $registry->getGauge('newsletterSubscriptionCount')->set($newsletterSubscriptionCount);

        return new Response($formatter->format($registry->collect()), 200, [
            'Content-Type' => $formatter->getMimeType(),
        ]);
    }
}
