<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Form\Type\ProfilePersonalDataFormType;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserError;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactory;

class UpdateProfilePersonalDataMutation
{
    private $em;
    private $formFactory;
    private $logger;

    public function __construct(EntityManagerInterface $em, FormFactory $formFactory, LoggerInterface $logger)
    {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->logger = $logger;
    }

    public function __invoke(Argument $input, User $user): array
    {
        $arguments = $input->getRawArguments();

        if ($arguments['userId'] != $user->getId()) {
            $this->logger->error(
                __METHOD__.' : User with id '.$user->getId(
                ).' try to get informations about user with id  '.$arguments['userId']
            );
            throw new UserError('Can\'t update !');
        }
        unset($arguments['userId']);
//        if($arguments['dateOfBirth'] && !$arguments['dateOfBirth'] instanceof \DateTime){
//            $arguments['dateOfBirth'] = new \DateTime($arguments['dateOfBirth']);
//        }

        $form = $this->formFactory->create(ProfilePersonalDataFormType::class, $user, ['csrf_protection' => false]);
        try {
            $form->submit($arguments, false);
        } catch (\LogicException $e) {
            $this->logger->error(__METHOD__.' : '.$e->getMessage());
        }

        if (!$form->isValid()) {
            $this->logger->error(__METHOD__.' : '.(string)$form->getErrors(true, false));
            throw new UserError('Can\'t update !');
        }

        $this->em->flush();

        return ['viewer' => $user];
    }
}
