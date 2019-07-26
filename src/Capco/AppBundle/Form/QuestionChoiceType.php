<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\QuestionChoice;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class QuestionChoiceType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('id');
        $builder->add('title', TextType::class, [
            'purify_html' => true,
            'purify_html_profile' => 'default'
        ]);
        $builder->add('description', TextType::class, [
            'purify_html' => true,
            'purify_html_profile' => 'default'
        ]);
        $builder->add('color');
        $builder->add('image');
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(['csrf_protection' => false, 'data_class' => QuestionChoice::class]);
    }
}
