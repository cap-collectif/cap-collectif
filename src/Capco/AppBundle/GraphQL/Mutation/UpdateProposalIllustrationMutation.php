<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\DataLoader\ProposalForm\ProposalFormProposalsDataLoader;
use Capco\AppBundle\GraphQL\Error\BaseProposalError;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Helper\ResponsesFormatter;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\MediaBundle\Repository\MediaRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Psr\Log\LoggerInterface;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;

class UpdateProposalIllustrationMutation extends CreateProposalMutation
{
    use MutationTrait;
    use ResolverTrait;

    public const MEDIA_NOT_FOUND = 'MEDIA_NOT_FOUND';
    private MediaRepository $mediaRepository;

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
        MediaRepository $mediaRepository
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
        $this->mediaRepository = $mediaRepository;
    }

    public function __invoke(Arg $input, $user): array
    {
        $this->formatInput($input);

        try {
            $viewer = $this->preventNullableViewer($user);
            $proposal = $this->getProposal($input, $viewer);
            $this->updateProposalIllustration($input, $proposal);

            return ['proposal' => $proposal, 'errorCode' => null];
        } catch (UserError $error) {
            return ['errorCode' => $error->getMessage()];
        }
    }

    private function getProposal(Arg $input, User $viewer): Proposal
    {
        $proposalId = $input->offsetGet('proposalId');
        $proposal = $this->globalIdResolver->resolve($proposalId, $viewer);
        if (!$proposal || !$proposal instanceof Proposal) {
            $this->logger->error('Unknown proposal with id: ' . $proposalId);

            throw new UserError(BaseProposalError::PROPOSAL_NOT_FOUND);
        }

        if (!$proposal->isUserAuthor($viewer) && !$viewer->isAdmin()) {
            throw new UserError(BaseProposalError::ACCESS_DENIED);
        }

        return $proposal;
    }

    private function updateProposalIllustration(Arg $input, Proposal $proposal): void
    {
        $values = $input->getArrayCopy();
        $media = null;
        if (
            !empty($values['media'])
            && !($media = $this->mediaRepository->find($values['media']))
        ) {
            throw new UserError(self::MEDIA_NOT_FOUND);
        }

        $proposal->setMedia($media);
        $this->em->flush();
    }
}
