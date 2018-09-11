<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Form\Type\ProfileFormType;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactory;

class UpdateProfileMutation implements MutationInterface
{
    private $em;
    private $formFactory;
    private $logger;

    public function __construct(
        EntityManagerInterface $em,
        FormFactory $formFactory,
        LoggerInterface $logger
    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->logger = $logger;
    }

    public function __invoke(Argument $input, User $user): array
    {
        $arguments = $input->getRawArguments();

        $form = $this->formFactory->create(ProfileFormType::class, $user, [
            'csrf_protection' => false,
        ]);
        $form->submit($arguments, false);

        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . (string) $form->getErrors(true, false));
            throw new UserError('Can\'t update !');
        }

        $this->em->flush();

        return ['viewer' => $user];
    }
}
