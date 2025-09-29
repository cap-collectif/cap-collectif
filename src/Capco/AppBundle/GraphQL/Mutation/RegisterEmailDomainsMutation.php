<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\RegistrationFormRepository;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Form\Type\AdminConfigureRegistrationType;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class RegisterEmailDomainsMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly FormFactoryInterface $formFactory,
        private readonly RegistrationFormRepository $registrationFormRepository,
        private readonly EntityManagerInterface $em
    ) {
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $this->formatInput($input);
        if (!$viewer || !$viewer->isAdmin()) {
            throw new AccessDeniedHttpException('Not authorized.');
        }
        $data = $input->getArrayCopy();

        $registrationForm = $this->registrationFormRepository->findCurrent();

        $form = $this->formFactory->create(
            AdminConfigureRegistrationType::class,
            $registrationForm
        );
        $form->submit($data, false);
        $this->em->flush();

        return ['domains' => $registrationForm->getDomains()->toArray()];
    }
}
