<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Repository\PostRepository;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Proposal;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Resolver\TypeResolver;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\ConnectionBuilder;
use Symfony\Component\Routing\RouterInterface;

class ProposalResolver implements ResolverInterface
{
    private $proposalRepository;
    private $router;
    private $postRepository;
    private $typeResolver;
    private $proposalFormRepository;

    public function __construct(
        ProposalRepository $proposalRepository,
        RouterInterface $router,
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

    public function resolveResponseType(AbstractResponse $response)
    {
        $currentSchemaName = $this->typeResolver->getCurrentSchemaName();

        if ($response instanceof MediaResponse) {
            if (\in_array($currentSchemaName, ['public', 'preview'], true)) {
                return $this->typeResolver->resolve('PreviewMediaResponse');
            }

            return $this->typeResolver->resolve('InternalMediaResponse');
        }

        if ($response instanceof ValueResponse) {
            if (\in_array($currentSchemaName, ['public', 'preview'], true)) {
                return $this->typeResolver->resolve('PreviewValueResponse');
            }

            return $this->typeResolver->resolve('InternalValueResponse');
        }

        throw new UserError('Could not resolve type of Response.');
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
            'deletedAt' => null,
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

        return null !== $evalForm &&
            (!$evalForm->isFullyPrivate() || $this->resolveViewerIsEvaluer($proposal, $user));
    }
}
