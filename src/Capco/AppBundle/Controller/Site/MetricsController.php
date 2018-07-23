<?php
namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\ProjectVisibilityMode;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use TweedeGolf\PrometheusClient\CollectorRegistry;
use TweedeGolf\PrometheusClient\Format\TextFormatter;

class MetricsController extends Controller
{
    /**
     * @Route("/metrics", name="capco_metrics")
     */
    public function metricsAction(): Response
    {
        $registry = $this->get(CollectorRegistry::class);
        $formatter = new TextFormatter();

        $registeredContributorCount = $this->get(
            'capco.user.repository'
        )->getRegisteredContributorCount();
        $registeredCount = $this->get('capco.user.repository')->getRegisteredCount();

        $anonymousComments = $this->get('capco.comment.repository')->getAnonymousCount();

        $commentCount = $this->get('capco.comment.repository')->countNotExpired();
        $voteCount = $this->get('capco.abstract_vote.repository')->countNotExpired();

        $opinionCount = $this->get('capco.opinion.repository')->getCount();
        $versionCount = $this->get('capco.opinion_version.repository')->getCount();
        $argumentCount = $this->get('capco.argument.repository')->getCount();
        $sourceCount = $this->get('capco.source.repository')->getCount();
        $proposalCount = $this->get('capco.proposal.repository')->getCount();
        $replyCount = $this->get('capco.reply.repository')->getCount();

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

        $projectCount = \count($this->get('Capco\AppBundle\Repository\ProjectRepository')->findBy(['visibility' => ProjectVisibilityMode::VISIBILITY_PUBLIC]));
        $steps = $this->get('capco.abstract_step.repository')->findAll();
        $contribuableStepsCount = \count(
            array_reduce($steps, function ($step) {
                return $step && $step->canContribute();
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

        $registry->getGauge('registered')->set($registeredCount);
        $registry->getGauge('registeredContributors')->set($registeredContributorCount);
        $registry->getGauge('projectCount')->set($projectCount);
        $registry->getGauge('contribuableStepsCount')->set($contribuableStepsCount);
        $registry->getGauge('voteCount')->set($voteCount);
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

        return new Response($formatter->format($registry->collect()), 200, [
            'Content-Type' => $formatter->getMimeType(),
        ]);
    }
}
