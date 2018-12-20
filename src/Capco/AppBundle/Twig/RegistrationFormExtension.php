<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Repository\RegistrationFormRepository;
use JMS\Serializer\SerializationContext;
use JMS\Serializer\Serializer;

class RegistrationFormExtension extends \Twig_Extension
{
    protected $formRepo;
    protected $serializer;

    public function __construct(RegistrationFormRepository $formRepo, Serializer $serializer)
    {
        $this->formRepo = $formRepo;
        $this->serializer = $serializer;
    }

    public function getFunctions(): array
    {
        return [
            new \Twig_SimpleFunction('registration_form_serialize', [$this, 'serializeFields']),
        ];
    }

    public function serializeFields(): array
    {
        $form = $this->formRepo->findCurrent();

        $serializedDomains = $this->serializer->serialize(
            $form ? $form->getDomains() : [],
            'json',
            (new SerializationContext())->setGroups(['EmailDomain'])
        );

        return [
            'bottomTextDisplayed' => $form ? $form->isBottomTextDisplayed() : '',
            'bottomText' => $form ? $form->getBottomText() : '',
            'topTextDisplayed' => $form ? $form->isTopTextDisplayed() : '',
            'topText' => $form ? $form->getTopText() : '',
            'hasQuestions' => $form ? $form->getRealQuestions()->count() > 0 : false,
            'domains' => json_decode($serializedDomains, true),
        ];
    }
}
