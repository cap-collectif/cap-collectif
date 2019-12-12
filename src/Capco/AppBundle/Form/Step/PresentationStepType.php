<?php

namespace Capco\AppBundle\Form\Step;

use Capco\AppBundle\Entity\Steps\PresentationStep;
use Symfony\Component\OptionsResolver\OptionsResolver;

class PresentationStepType extends AbstractStepType
{
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => PresentationStep::class
        ]);
    }
}
