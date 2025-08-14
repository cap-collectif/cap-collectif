<?php

namespace Capco\AppBundle\GraphQL\Mutation\Participant;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Form\ParticipantType;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Service\ParticipantHelper;
use Capco\AppBundle\Traits\FormValidationErrorsTraits;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Form\FormFactoryInterface;

class UpdateParticipantMutation implements MutationInterface
{
    use FormValidationErrorsTraits;
    use MutationTrait;

    public function __construct(private EntityManagerInterface $em, private FormFactoryInterface $formFactory, private ParticipantHelper $participantHelper)
    {
    }

    /**
     * @return array{participant: Capco\AppBundle\Entity\Participant|null, validationErrors: non-empty-string|false}
     */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);
        $data = $input->getArrayCopy();
        $token = $input->offsetGet('token');
        unset($data['token']);

        $participant = $this->participantHelper->getParticipantByToken($token);
        $form = $this->formFactory->create(ParticipantType::class, $participant);

        if ($input->offsetGet('phone')) {
            $participant->setPhoneConfirmed(false);
        }

        $form->submit($data, false);

        $validationErrors = $this->getFormValidationErrors($form);

        if (!empty($validationErrors)) {
            return ['participant' => $participant, 'validationErrors' => json_encode($validationErrors)];
        }

        $this->em->flush();

        return ['participant' => $participant, 'validationErrors' => null];
    }
}
