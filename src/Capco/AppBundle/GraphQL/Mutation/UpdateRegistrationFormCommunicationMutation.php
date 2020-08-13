<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Repository\RegistrationFormRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class UpdateRegistrationFormCommunicationMutation implements MutationInterface
{
    private $em;
    private $registrationFormRepository;

    public function __construct(
        EntityManagerInterface $em,
        RegistrationFormRepository $registrationFormRepository
    ) {
        $this->em = $em;
        $this->registrationFormRepository = $registrationFormRepository;
    }

    public function __invoke(Argument $input): array
    {
        $arguments = $input->getArrayCopy();

        $registrationForm = $this->registrationFormRepository->findCurrent();
        if (!$registrationForm) {
            throw new UserError('No registration form');
        }

        if (isset($arguments['topTextDisplayed'])) {
            $registrationForm->setTopTextDisplayed($arguments['topTextDisplayed']);
        }
        if (isset($arguments['bottomTextDisplayed'])) {
            $registrationForm->setBottomTextDisplayed($arguments['bottomTextDisplayed']);
        }

        if (isset($arguments['translations'])) {
            foreach ($arguments['translations'] as $translation) {
                $registrationForm
                    ->translate($translation['locale'], false)
                    ->setTopText($translation['topText'] ?? '')
                    ->setBottomText($translation['bottomText'] ?? '');
            }
            $registrationForm->mergeNewTranslations();
        }

        $this->em->flush();

        return compact('registrationForm');
    }
}
