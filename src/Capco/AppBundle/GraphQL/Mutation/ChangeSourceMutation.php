<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Source;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Form\ApiSourceType;
use Symfony\Component\Form\FormFactoryInterface;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Repository\SourceRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class ChangeSourceMutation implements MutationInterface
{
    private $em;
    private $sourceRepo;
    private $formFactory;
    private $redisStorage;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        SourceRepository $sourceRepo,
        RedisStorageHelper $redisStorage
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->sourceRepo = $sourceRepo;
        $this->redisStorage = $redisStorage;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $sourceId = $input->offsetGet('sourceId');
        /** @var Source $source */
        $source = $this->sourceRepo->find($sourceId);

        if (!$source) {
            throw new UserError("Unknown source with id: ${sourceId}");
        }

        if ($viewer !== $source->getAuthor()) {
            throw new UserError("Can't update the source of someone else.");
        }

        if (!$source->canContribute($viewer)) {
            throw new UserError("Can't update uncontributable source.");
        }

        $values = $input->getRawArguments();
        unset($values['sourceId']);

        $form = $this->formFactory->create(ApiSourceType::class, $source);
        $form->submit($values, false);

        if (!$form->isValid()) {
            throw GraphQLException::fromFormErrors($form);
        }

        $source->resetVotes();

        $this->em->flush();

        return ['source' => $source];
    }
}
