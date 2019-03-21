<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Form\Type\PurifiedTextType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class QuestionnaireCreateType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('title', PurifiedTextType::class);
        $builder->add('type');
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'data_class' => Questionnaire::class,
        ]);
    }
}
