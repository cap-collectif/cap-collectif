<?php

namespace Capco\AppBundle\Form\Type;

use Exercise\HTMLPurifierBundle\Form\HTMLPurifierTransformer;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\OptionsResolver\OptionsResolver;

class PurifiedTextareaType extends AbstractType
{
    private $purifier;

    public function __construct(HTMLPurifierTransformer $purifier)
    {
        $this->purifier = $purifier;
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->addViewTransformer($this->purifier);

        $builder->addEventListener(FormEvents::SUBMIT, [$this, 'updateValue']);
    }

    public function getParent()
    {
        return TextareaType::class;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'compound' => false,
        ]);
    }

    public function updateValue(FormEvent $event)
    {
        if ('' === $event->getData()) {
            $event->setData(null);
        }
    }
}
