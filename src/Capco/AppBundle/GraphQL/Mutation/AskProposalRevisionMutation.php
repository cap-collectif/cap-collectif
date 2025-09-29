<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalRevision;
use Capco\AppBundle\Enum\ProposalStatementErrorCode;
use Capco\AppBundle\Form\ProposalRevisionType;
use Capco\AppBundle\GraphQL\ConnectionBuilderInterface;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
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
    use MutationTrait;
    use ResolverTrait;

    public function __construct(
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly EntityManagerInterface $em,
        private readonly ConnectionBuilderInterface $builder,
        private readonly AuthorizationCheckerInterface $authorizationChecker,
        private readonly FormFactoryInterface $formFactory,
        private readonly LoggerInterface $logger,
        private readonly Publisher $publisher,
        private readonly Indexer $indexer
    ) {
    }

    public function __invoke(Arg $input, $viewer): array
    {
        $this->formatInput($input);
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
