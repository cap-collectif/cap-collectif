<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Form\ApiSourceType;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\Requirement\StepRequirementsResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Model\Sourceable;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;

class AddSourceMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(private readonly EntityManagerInterface $em, private readonly FormFactoryInterface $formFactory, private readonly OpinionRepository $opinionRepo, private readonly OpinionVersionRepository $versionRepo, private readonly RedisStorageHelper $redisStorage, private readonly LoggerInterface $logger, private readonly StepRequirementsResolver $stepRequirementsResolver)
    {
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $this->formatInput($input);
        $sourceableId = $input->offsetGet('sourceableId');
        $sourceable = $this->versionRepo->find($sourceableId);

        if (!$sourceable) {
            $sourceable = $this->opinionRepo->find(GlobalId::fromGlobalId($sourceableId)['id']);
        }

        if (!$sourceable || !$sourceable instanceof Sourceable) {
            $this->logger->error('Unknown Sourceable with id: ' . $sourceableId);
            $error = ['message' => 'Unknown Sourceable.'];

            return ['source' => null, 'sourceEdge' => null, 'userErrors' => [$error]];
        }

        if (!$sourceable->canContribute($viewer)) {
            $this->logger->error(
                'Can\'t add an source to an uncontributable sourceable with id: ' . $sourceableId
            );
            $error = ['message' => 'Can\'t add an source to an uncontributable sourceable.'];

            return ['source' => null, 'sourceEdge' => null, 'userErrors' => [$error]];
        }
        if (!$sourceable->getOpinionType() || !$sourceable->getOpinionType()->isSourceable()) {
            $error = ['message' => 'Can\'t add an source to non-sourceable.'];

            return ['source' => null, 'sourceEdge' => null, 'userErrors' => [$error]];
        }

        $step = $sourceable->getStep();

        if (
            $step
            && !$this->stepRequirementsResolver->viewerMeetsTheRequirementsResolver($viewer, $step)
        ) {
            $this->logger->error('You dont meets all the requirements.');
            $error = ['message' => 'You dont meets all the requirements.'];

            return ['argument' => null, 'argumentEdge' => null, 'userErrors' => [$error]];
        }

        $source = (new Source())->setType(Source::LINK)->setAuthor($viewer);
        if ($sourceable instanceof Opinion) {
            $source->setOpinion($sourceable);
        }
        if ($sourceable instanceof OpinionVersion) {
            $source->setOpinionVersion($sourceable);
        }

        $values = $input->getArrayCopy();
        unset($values['sourceableId']);
        $form = $this->formFactory->create(ApiSourceType::class, $source);
        $form->submit($values, false);

        if (!$form->isValid()) {
            throw GraphQLException::fromFormErrors($form);
        }

        $this->em->persist($source);
        $this->em->flush();

        $this->redisStorage->recomputeUserCounters($viewer);

        $edge = new Edge(ConnectionBuilder::offsetToCursor(0), $source);

        return ['source' => $source, 'sourceEdge' => $edge, 'userErrors' => []];
    }
}
