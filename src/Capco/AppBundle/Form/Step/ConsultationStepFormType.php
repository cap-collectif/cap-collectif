<?php

namespace Capco\AppBundle\Form\Step;

use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ConsultationStepFormType extends AbstractStepFormType
{
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => ConsultationStep::class,
        ]);
    }
}
