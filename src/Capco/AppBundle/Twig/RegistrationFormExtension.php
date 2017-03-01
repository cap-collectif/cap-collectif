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
            new \Twig_SimpleFunction('registration_form_list_fields', [$this, 'serializeFields']),
        ];
    }

    public function serializeFields()
    {
        $form = $this->formRepo->findCurrent();
        $serializedQuestions = $this->serializer->serialize(
            $form->getRealQuestions(),
            'json',
            (new SerializationContext())->setGroups(['Questions'])
        );

        return json_decode($serializedQuestions, true);
    }
}
