<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Repository\RegistrationFormRepository;
use Symfony\Component\Serializer\SerializerInterface;

class RegistrationFormExtension extends \Twig_Extension
{
    protected $formRepo;
    protected $serializer;

    public function __construct(
        RegistrationFormRepository $formRepo,
        SerializerInterface $serializer
    ) {
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
        $serializedQuestions = $this->serializer->serialize(
            $form ? $form->getRealQuestions() : [],
            'json',
            [
                'groups' => ['Questions'],
            ]
        );

        $serializedDomains = $this->serializer->serialize(
            $form ? $form->getDomains() : [],
            'json',
            [
                'groups' => ['EmailDomain'],
            ]
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
