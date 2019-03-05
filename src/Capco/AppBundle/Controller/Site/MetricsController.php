<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\AppBundle\Repository\AbstractVoteRepository;
use Capco\AppBundle\Repository\ProjectRepository;
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
            'capco.user.repository'
        )->getRegisteredContributorCount();

        $registeredConfirmedByEmail = $this->get('capco.user.repository')->getRegisteredCount();

        $registeredNotConfirmedByEmail = $this->get(
            'capco.user.repository'
        )->getRegisteredNotConfirmedByEmailCount();

        $commentCount = $this->get('capco.comment.repository')->countPublished();
        $voteCount = $this->get(AbstractVoteRepository::class)->countPublished();
        $voteUnpublishedCount = $this->get(AbstractVoteRepository::class)->countUnpublished();

        $opinionCount = $this->get('capco.opinion.repository')->countPublished();
        $versionCount = $this->get('capco.opinion_version.repository')->countPublished();
        $argumentCount = $this->get('capco.argument.repository')->countPublished();
        $sourceCount = $this->get('capco.source.repository')->countPublished();
        $proposalCount = $this->get('capco.proposal.repository')->countPublished();
        $replyCount = $this->get('capco.reply.repository')->countPublished();

        $contributionCount =
            $opinionCount +
            $versionCount +
            $argumentCount +
            $sourceCount +
            $proposalCount +
            $replyCount;

        $contributionTrashedCount = 0;
        $contributionTrashedCount += $this->get('capco.opinion.repository')->countTrashed();
        $contributionTrashedCount += $this->get('capco.opinion_version.repository')->countTrashed();
        $contributionTrashedCount += $this->get('capco.argument.repository')->countTrashed();
        $contributionTrashedCount += $this->get('capco.source.repository')->countTrashed();
        $contributionTrashedCount += $this->get('capco.proposal.repository')->countTrashed();

        $contributionUnpublishedCount = 0;
        $contributionUnpublishedCount += $this->get('capco.opinion.repository')->countUnpublished();
        $contributionUnpublishedCount += $this->get(
            'capco.opinion_version.repository'
        )->countUnpublished();
        $contributionUnpublishedCount += $this->get(
            'capco.argument.repository'
        )->countUnpublished();
        $contributionUnpublishedCount += $this->get('capco.source.repository')->countUnpublished();
        $contributionUnpublishedCount += $this->get(
            'capco.proposal.repository'
        )->countUnpublished();

        $projectCount = \count(
            $this->get(ProjectRepository::class)->findBy([
                'visibility' => ProjectVisibilityMode::VISIBILITY_PUBLIC,
            ])
        );
        $steps = $this->get('capco.abstract_step.repository')->findAll();
        $contribuableStepsCount = \count(
            array_reduce($steps, function ($step) {
                return $step && $step->canContribute($this->getUser());
            })
        );

        $reportCount = \count($this->get('capco.reporting.repository')->findAll());
        // Traité ou non ?
        $reportArchivedCount = \count(
            $this->get('capco.reporting.repository')->findBy(['isArchived' => true])
        );

        // Followers
        $followerCount = \count($this->get('capco.follower.repository')->findAll());

        // Newsletter inscription
        $newsletterSubscriptionCount = \count(
            $this->get('capco.newsletter_subscription.repository')->findAll()
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
