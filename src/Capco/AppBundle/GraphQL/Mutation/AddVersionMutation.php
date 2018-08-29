<?php
namespace Capco\AppBundle\GraphQL\Mutation;

use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Opinion;
use Symfony\Component\Form\FormFactory;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\Entity\OpinionVersion;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\Form\OpinionVersionType;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Repository\OpinionRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\ConnectionBuilder;

class AddVersionMutation implements MutationInterface
{
    private $em;
    private $opinionRepo;
    private $versionRepo;
    private $formFactory;
    private $redisStorage;
    private $logger;

    public function __construct(
        EntityManagerInterface $em,
        FormFactory $formFactory,
        OpinionRepository $opinionRepo,
        OpinionVersionRepository $versionRepo,
        RedisStorageHelper $redisStorage,
        LoggerInterface $logger
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->opinionRepo = $opinionRepo;
        $this->versionRepo = $versionRepo;
        $this->redisStorage = $redisStorage;
        $this->logger = $logger;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $opinionId = $input->offsetGet('opinionId');
        $opinion = $this->opinionRepo->find($opinionId);

        if (!$opinion || !$opinion instanceof Opinion) {
            $this->logger->error("Unknown opinion with id: $opinionId");
            $error = ['message' => 'Unknown opinion.'];
            return ['version' => null, 'versionEdge' => null, 'userErrors' => [$error]];
        }

        if (!$opinion->canContribute($viewer)) {
            $this->logger->error(
                'Can\'t add a version to an uncontributable opinion with id: ' . $opinionId
            );
            $error = ['message' => 'Can\'t add a version to an uncontributable opinion.'];
            return ['version' => null, 'versionEdge' => null, 'userErrors' => [$error]];
        }

        if (0 === $opinion->getOpinionType()->isVersionable()) {
            $this->logger->error("Can't add a version to an unversionable opinion.");
            $error = ['message' => "Can't add a version to an unversionable opinion."];
            return ['version' => null, 'versionEdge' => null, 'userErrors' => [$error]];
        }

        $version = (new OpinionVersion())->setAuthor($viewer)->setParent($opinion);
        $values = $input->getRawArguments();
        unset($values['opinionId']);

        $form = $this->formFactory->create(OpinionVersionType::class, $version);
        $form->submit($values, false);

        if (!$form->isValid()) {
            throw GraphQLException::fromFormErrors($form);
        }

        $this->em->persist($version);
        $this->em->flush();

        $this->redisStorage->recomputeUserCounters($viewer);

        $totalCount = 0;
        $edge = new Edge(ConnectionBuilder::offsetToCursor($totalCount), $version);

        return ['version' => $version, 'versionEdge' => $edge, 'userErrors' => []];
    }
}
