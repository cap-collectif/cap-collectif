<?php

namespace Capco\AppBundle\Form\Step;

use Capco\AppBundle\Entity\Steps\SynthesisStep;
use Capco\AppBundle\Entity\Synthesis\Synthesis;
use Capco\AppBundle\Form\Type\RelayNodeType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class SynthesisStepFormType extends AbstractStepFormType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        parent::buildForm($builder, $options);
        $builder->add('synthesis', RelayNodeType::class, [
            'class' => Synthesis::class
        ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => SynthesisStep::class
        ]);
    }
}
