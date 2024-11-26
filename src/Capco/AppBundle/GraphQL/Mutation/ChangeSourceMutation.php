<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Form\ApiSourceType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\SourceRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Util\ClassUtils;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\Form\FormFactoryInterface;

class ChangeSourceMutation implements MutationInterface
{
    use MutationTrait;
    private readonly EntityManagerInterface $em;
    private readonly SourceRepository $sourceRepo;
    private readonly FormFactoryInterface $formFactory;
    private readonly Indexer $indexer;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        SourceRepository $sourceRepo,
        Indexer $indexer
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->sourceRepo = $sourceRepo;
        $this->indexer = $indexer;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $this->formatInput($input);
        $sourceId = GlobalId::fromGlobalId($input->offsetGet('sourceId'))['id'];
        /** @var Source $source */
        $source = $this->sourceRepo->find($sourceId);

        if (!$source) {
            throw new UserError("Unknown source with id: {$sourceId}");
        }

        if ($viewer !== $source->getAuthor()) {
            throw new UserError("Can't update the source of someone else.");
        }

        if (!$source->canContribute($viewer)) {
            throw new UserError("Can't update uncontributable source.");
        }

        $values = $input->getArrayCopy();
        unset($values['sourceId']);

        $form = $this->formFactory->create(ApiSourceType::class, $source);
        $form->submit($values, false);

        if (!$form->isValid()) {
            throw GraphQLException::fromFormErrors($form);
        }

        $this->resetVotes($source);

        $this->em->flush();
        $this->indexer->finishBulk();

        return ['source' => $source];
    }

    private function resetVotes(Source $source): Source
    {
        foreach ($source->getVotes() as $vote) {
            $this->indexer->remove(ClassUtils::getClass($vote), $vote->getId());
        }
        $source->resetVotes();

        return $source;
    }
}
