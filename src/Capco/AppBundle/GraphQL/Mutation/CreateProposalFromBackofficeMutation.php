<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Form\ProposalAdminType;
use Capco\AppBundle\GraphQL\DataLoader\ProposalForm\ProposalFormProposalsDataLoader;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Helper\ResponsesFormatter;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserError;
use Psr\Log\LoggerInterface;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationChecker;

class CreateProposalFromBackofficeMutation extends CreateProposalMutation
{
    private AuthorizationChecker $authorizationChecker;

    public function __construct(
        LoggerInterface $logger,
        GlobalIdResolver $globalidResolver,
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        ProposalFormRepository $proposalFormRepository,
        RedisStorageHelper $redisStorageHelper,
        ProposalFormProposalsDataLoader $proposalFormProposalsDataLoader,
        Indexer $indexer,
        Manager $toggleManager,
        ResponsesFormatter $responsesFormatter,
        ProposalRepository $proposalRepository,
        Publisher $publisher,
        AuthorizationChecker $authorizationChecker
    ) {
        parent::__construct(
            $logger,
            $globalidResolver,
            $em,
            $formFactory,
            $proposalFormRepository,
            $redisStorageHelper,
            $proposalFormProposalsDataLoader,
            $indexer,
            $toggleManager,
            $responsesFormatter,
            $proposalRepository,
            $publisher
        );
        $this->authorizationChecker = $authorizationChecker;
    }

    public function __invoke(Argument $input, $user): array
    {
        $values = $input->getArrayCopy();
        $proposalForm = $this->getProposalForm($values, $user);
        unset($values['proposalFormId']); // This only useful to retrieve the proposalForm
        $author = $this->globalIdResolver->resolve($values['author'], $user);

        $proposal = $this->createAndIndexProposal(
            $values,
            $proposalForm,
            $author,
            $author,
            false,
            ProposalAdminType::class
        );

        return ['proposal' => $proposal];
    }

    public function isGranted(User $viewer, string $proposalFormId): bool
    {
        $project = $this->getProposalForm(
            ['proposalFormId' => $proposalFormId],
            $viewer
        )->getProject();
        if ($project) {
            return $this->authorizationChecker->isGranted(
                ProjectVoter::CREATE_PROPOSAL_FROM_BO,
                $project
            );
        }

        return false;
    }

    protected function getProposalForm(array $values, User $viewer): ProposalForm
    {
        /** @var ProposalForm $proposalForm */
        $proposalForm = $this->proposalFormRepository->find($values['proposalFormId']);
        if (!$proposalForm) {
            $error = sprintf('Unknown proposalForm with id "%s"', $values['proposalFormId']);
            $this->logger->error($error);

            throw new UserError($error);
        }

        return $proposalForm;
    }
}
