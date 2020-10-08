<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\NumberType;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\FormBuilderInterface;

class SimpleQuestionType extends AbstractQuestionType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        parent::buildForm($builder, $options);
        $builder->add('isRangeBetween', CheckboxType::class, ['required' => false]);
        $builder->add('rangeMin', NumberType::class, ['required' => false]);
        $builder->add('rangeMax', NumberType::class, ['required' => false]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(['csrf_protection' => false, 'data_class' => SimpleQuestion::class]);
    }
}
