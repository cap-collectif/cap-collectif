<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use Symfony\Component\OptionsResolver\OptionsResolver;

class SimpleQuestionType extends AbstractQuestionType
{

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(['csrf_protection' => false, 'data_class' => SimpleQuestion::class]);
    }
}
