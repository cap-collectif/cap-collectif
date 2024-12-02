<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Form\OpinionForm;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\RegistrationFormRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;

class UpdateOpinionMutation implements MutationInterface
{
    use MutationTrait;

    final public const NOT_AUTHORIZED = 'NOT_AUTHORIZED';
    final public const INVALID_FORM = 'INVALID_FORM';
    final public const OPINION_NOT_CONTRIBUABLE = 'OPINION_NOT_CONTRIBUABLE';

    public function __construct(private readonly FormFactoryInterface $formFactory, private readonly RegistrationFormRepository $registrationFormRepository, private readonly EntityManagerInterface $em, private readonly OpinionRepository $opinionRepository, private readonly Publisher $publisher)
    {
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $this->formatInput($input);
        $opinionId = $input->offsetGet('opinionId');
        $data = $input->getArrayCopy();

        return $this->updateOpinion($opinionId, $viewer, $data);
    }

    private function updateOpinion(string $id, User $viewer, array $data): array
    {
        unset($data['opinionId']);

        $opinion = $this->opinionRepository->getOne(GlobalId::fromGlobalId($id)['id']);
        if (!$viewer || $viewer !== $opinion->getAuthor()) {
            return ['opinion' => null, 'errorCode' => self::NOT_AUTHORIZED];
        }

        if (!$opinion->canContribute($viewer)) {
            return ['opinion' => null, 'errorCode' => self::OPINION_NOT_CONTRIBUABLE];
        }

        $form = $this->formFactory->create(OpinionForm::class, $opinion);
        $form->submit($data, false);

        if (!$form->isValid()) {
            return ['opinion' => null, 'errorCode' => self::INVALID_FORM];
        }

        $opinion->resetVotes();
        $this->em->flush();

        $this->publisher->publish(
            CapcoAppBundleMessagesTypes::OPINION_UPDATE,
            new Message(json_encode(['opinionId' => $opinion->getId()]))
        );

        return ['opinion' => $opinion];
    }
}
