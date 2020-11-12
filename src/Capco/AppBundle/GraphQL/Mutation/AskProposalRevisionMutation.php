<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalRevision;
use Capco\AppBundle\Enum\ProposalStatementErrorCode;
use Capco\AppBundle\Form\ProposalRevisionType;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Doctrine\Common\Util\ClassUtils;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class AskProposalRevisionMutation implements MutationInterface
{
    use ResolverTrait;

    private GlobalIdResolver $globalIdResolver;
    private EntityManagerInterface $em;
    private ConnectionBuilder $builder;
    private AuthorizationCheckerInterface $authorizationChecker;
    private Publisher $publisher;
    private FormFactoryInterface $formFactory;
    private LoggerInterface $logger;
    private Indexer $indexer;

    public function __construct(
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $em,
        ConnectionBuilder $builder,
        AuthorizationCheckerInterface $authorizationChecker,
        FormFactoryInterface $formFactory,
        LoggerInterface $logger,
        Publisher $publisher,
        Indexer $indexer
    ) {
        $this->globalIdResolver = $globalIdResolver;
        $this->em = $em;
        $this->builder = $builder;
        $this->authorizationChecker = $authorizationChecker;
        $this->formFactory = $formFactory;
        $this->logger = $logger;
        $this->publisher = $publisher;
        $this->indexer = $indexer;
    }

    public function __invoke(Arg $input, $viewer): array
    {
        $this->preventNullableViewer($viewer);

        $proposalId = $input->offsetGet('proposalId');
        /** @var Proposal $proposal */
        $proposal = $this->globalIdResolver->resolve($proposalId, $viewer);

        if (!$proposal) {
            $this->logger->error('Unknown proposal with id: ' . $proposalId);

            return $this->generateErrorPayload(ProposalStatementErrorCode::NON_EXISTING_PROPOSAL);
        }
        $proposalRevision = new ProposalRevision();
        $proposalRevision->setProposal($proposal)->setAuthor($viewer);
        $proposal->addRevision($proposalRevision);
        $values = $input->getArrayCopy();
        unset($values['proposalId']);

        $form = $this->formFactory->create(ProposalRevisionType::class, $proposalRevision);
        $form->submit($values, false);
        if (!$form->isValid()) {
            $this->logger->error('Invalid `ProposalRevisionType` form data.', [
                'errors' => GraphQLException::getPlainErrors($form),
            ]);

            return $this->generateErrorPayload(ProposalStatementErrorCode::INVALID_FORM);
        }

        $this->em->flush();
        $message = [
            'proposalRevisionId' => $proposalRevision->getId(),
            'proposalId' => $proposalRevision->getProposal()->getId(),
        ];
        $this->publisher->publish(
            CapcoAppBundleMessagesTypes::PROPOSAL_REVISION,
            new Message(json_encode($message))
        );

        $this->indexer->index(ClassUtils::getClass($proposal), $proposal->getId());
        $this->indexer->finishBulk();

        return ['proposal' => $proposal, 'errorCode' => null];
    }

    private function generateErrorPayload(string $errorCode): array
    {
        return ['proposal' => null, 'errorCode' => $errorCode];
    }
}
