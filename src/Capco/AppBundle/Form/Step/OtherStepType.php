<?php

namespace Capco\AppBundle\Form\Step;

use Capco\AppBundle\Entity\Steps\OtherStep;
use Symfony\Component\OptionsResolver\OptionsResolver;

class OtherStepType extends AbstractStepType
{

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => OtherStep::class
        ]);
    }
}
