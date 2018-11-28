<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Repository\PostRepository;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\RankingStep;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Entity\Steps\SynthesisStep;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\Entity\Interfaces\Trashable;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\PresentationStep;
use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Resolver\TypeResolver;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\ConnectionBuilder;
use Symfony\Component\Routing\Router;

class ProposalResolver implements ResolverInterface
{
    private $proposalRepository;
    private $router;
    private $postRepository;
    private $typeResolver;
    private $proposalFormRepository;

    public function __construct(
        ProposalRepository $proposalRepository,
        Router $router,
        PostRepository $postRepository,
        TypeResolver $typeResolver,
        ProposalFormRepository $proposalFormRepository
    ) {
        $this->proposalRepository = $proposalRepository;
        $this->router = $router;
        $this->postRepository = $postRepository;
        $this->typeResolver = $typeResolver;
        $this->proposalFormRepository = $proposalFormRepository;
    }

    public function resolveViewerIsEvaluer(Proposal $proposal, $user): bool
    {
        return $user instanceof User
            ? $this->proposalRepository->isViewerAnEvaluer($proposal, $user)
            : false;
    }

    public function resolveProjectSteps(Project $project): array
    {
        return $project->getRealSteps();
    }

    public function resolveShowUrlBySlug(
        string $projectSlug,
        string $stepSlug,
        string $proposalSlug
    ): ?string {
        return $this->router->generate(
            'app_project_show_proposal',
            compact('projectSlug', 'stepSlug', 'proposalSlug'),
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }

    public function resolvePostAbstract(Post $post): string
    {
        return $post->getAbstractOrBeginningOfTheText();
    }

    public function resolveNews(Proposal $proposal)
    {
        return $this->postRepository->getPublishedPostsByProposal($proposal);
    }

    public function resolveStepType(AbstractStep $step)
    {
        if ($step instanceof SelectionStep) {
            return $this->typeResolver->resolve('SelectionStep');
        }
        if ($step instanceof CollectStep) {
            return $this->typeResolver->resolve('CollectStep');
        }
        if ($step instanceof PresentationStep) {
            return $this->typeResolver->resolve('PresentationStep');
        }
        if ($step instanceof QuestionnaireStep) {
            return $this->typeResolver->resolve('QuestionnaireStep');
        }
        if ($step instanceof ConsultationStep) {
            return $this->typeResolver->resolve('InternalConsultation');
        }
        if ($step instanceof OtherStep) {
            return $this->typeResolver->resolve('OtherStep');
        }
        if ($step instanceof SynthesisStep) {
            return $this->typeResolver->resolve('SynthesisStep');
        }
        if ($step instanceof RankingStep) {
            return $this->typeResolver->resolve('RankingStep');
        }

        throw new UserError('Could not resolve type of Step.');
    }

    public function resolveResponseType(AbstractResponse $response)
    {
        if ($response instanceof MediaResponse) {
            return $this->typeResolver->resolve('MediaResponse');
        }
        if ($response instanceof ValueResponse) {
            return $this->typeResolver->resolve('ValueResponse');
        }

        throw new UserError('Could not resolve type of Response.');
    }

    public function resolveShowUrl(Proposal $proposal): string
    {
        $step = $proposal->getStep();
        $project = $step->getProject();
        if (!$project) {
            return '';
        }

        return $this->router->generate(
            'app_project_show_proposal',
            [
                'proposalSlug' => $proposal->getSlug(),
                'projectSlug' => $project->getSlug(),
                'stepSlug' => $step->getSlug(),
            ],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }

    public function resolveAdminUrl(Proposal $proposal): string
    {
        return $this->router->generate(
            'admin_capco_app_proposal_edit',
            ['id' => $proposal->getId()],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }

    public function resolveReference(Proposal $proposal): string
    {
        return $proposal->getFullReference();
    }

    public function resolveEvaluation(Proposal $proposal)
    {
        return $proposal->getProposalEvaluation();
    }

    public function resolveDraftProposalsForUserInStep(
        CollectStep $step,
        User $user,
        Argument $args
    ): Connection {
        $proposalForm = $this->proposalFormRepository->findOneBy([
            'step' => $step->getId(),
        ]);

        if (!$proposalForm) {
            throw new UserError(sprintf('Unknown proposal form for step "%d"', $step->getId()));
        }

        $proposals = $this->proposalRepository->findBy([
            'draft' => true,
            'author' => $user,
            'proposalForm' => $proposalForm,
        ]);

        $connection = ConnectionBuilder::connectionFromArray($proposals, $args);
        $connection->totalCount = \count($proposals);
        $connection->{'fusionCount'} = 0;

        return $connection;
    }

    public function resolvePostsCount(Proposal $proposal): int
    {
        return $this->postRepository->countPublishedPostsByProposal($proposal);
    }

    public function resolveViewerCanSeeEvaluation(Proposal $proposal, $user): bool
    {
        $evalForm = $proposal->getProposalForm()->getEvaluationForm();

        return (
            null !== $evalForm &&
            (!$evalForm->isFullyPrivate() || $this->resolveViewerIsEvaluer($proposal, $user))
        );
    }
}
