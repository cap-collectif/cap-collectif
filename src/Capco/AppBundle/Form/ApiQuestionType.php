<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Form\Type\PurifiedTextType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ApiQuestionType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('type', PurifiedTextType::class, ['required' => true])
            ->add('question', PurifiedTextType::class, ['required' => true])
            ->add('required', CheckboxType::class, ['required' => true])
            ->add('choices', CollectionType::class, [
                'entry_type' => ApiQuestionChoiceType::class,
                'allow_add' => true,
                'required' => false,
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'cascade_validate' => true,
        ]);
    }
}
